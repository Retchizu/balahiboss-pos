# Simplified Busiest Period Analytics Service

## File: `src/services/analytics/busiestPeriod.ts`

```ts
import { Request, Response } from "express";
import { toPHTRange } from "@/utils/phtRange";
import { getFirestoreDb } from "@/firebase/admin";
import Transaction from "@/types/Transaction";
import {
  DayOfWeekStats,
  WeekStats,
  TimePeriodStats,
  BusiestPeriodResponse,
} from "@/types/metrics/BusiestPeriod";
import { toZonedTime } from "date-fns-tz";
import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  format,
} from "date-fns";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timeZone = "Asia/Manila"; // PHT

export const getBusiestPeriod = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const startDate =
      typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate =
      typeof req.query.endDate === "string" ? req.query.endDate : undefined;

    // Convert date range to PHT
    const { startIso, endIso, windowDays } = toPHTRange(startDate, endDate);

    // Get Firestore instance
    const firestoreDb = getFirestoreDb();

    // Query transactions in date range
    const snapshot = await firestoreDb
      .collection("transactions")
      .where("date", ">=", startIso)
      .where("date", "<=", endIso)
      .get();

    // Aggregate by day of week
    const dayOfWeekCounts = new Map<number, number>();
    // Initialize all days to 0
    for (let i = 0; i < 7; i++) {
      dayOfWeekCounts.set(i, 0);
    }

    // Aggregate by calendar week
    const weekCounts = new Map<string, number>();
    const weekMetadata = new Map<
      string,
      { 
        year: number; 
        weekNumber: number; 
        weekStart: string; 
        weekEnd: string;
        weekStartDate: Date;
        weekEndDate: Date;
      }
    >();

    // Aggregate by hour of day (0-23)
    const hourCounts = new Map<number, number>();
    // Initialize all hours to 0
    for (let i = 0; i < 24; i++) {
      hourCounts.set(i, 0);
    }

    let totalTransactions = 0;

    // Process each transaction
    for (const doc of snapshot.docs) {
      const tx = doc.data() as Transaction;

      if (typeof tx.date !== "string") continue;

      totalTransactions++;

      // Convert UTC ISO to PHT
      const utcDate = new Date(tx.date);
      const phtDate = toZonedTime(utcDate, timeZone);

      // Extract day of week (0=Sunday, 6=Saturday)
      const dayOfWeek = phtDate.getDay();
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);

      // Extract hour of day (0-23)
      const hour = phtDate.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);

      // Extract ISO week
      const year = getISOWeekYear(phtDate);
      const weekNumber = getISOWeek(phtDate);
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

      // Update week count
      weekCounts.set(weekKey, (weekCounts.get(weekKey) || 0) + 1);

      // Store week metadata if not already stored
      if (!weekMetadata.has(weekKey)) {
        const weekStart = startOfISOWeek(phtDate);
        const weekEnd = endOfISOWeek(phtDate);
        weekMetadata.set(weekKey, {
          year,
          weekNumber,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
        });
      }
    }

    // Build day of week stats - sorted by transaction count (descending)
    const busiestDays: DayOfWeekStats[] = Array.from(dayOfWeekCounts.entries())
      .map(([dayNumber, transactionCount]) => ({
        dayName: DAY_NAMES[dayNumber],
        dayNumber,
        transactionCount,
      }))
      .sort((a, b) => {
        // Sort by transaction count (descending), then by day number (ascending)
        if (b.transactionCount !== a.transactionCount) {
          return b.transactionCount - a.transactionCount;
        }
        return a.dayNumber - b.dayNumber;
      });

    // Build calendar week stats - sorted by transaction count (descending)
    const busiestWeeks: WeekStats[] = Array.from(weekCounts.entries())
      .map(([weekKey, transactionCount]) => {
        const metadata = weekMetadata.get(weekKey);
        if (!metadata) {
          throw new Error(`Missing metadata for week ${weekKey}`);
        }
        
        // Format readable date: "Jan 20 - Jan 26, 2025"
        const readableDate = `${format(metadata.weekStartDate, "MMM d")} - ${format(metadata.weekEndDate, "MMM d, yyyy")}`;
        
        return {
          weekKey,
          year: metadata.year,
          weekNumber: metadata.weekNumber,
          transactionCount,
          weekStart: metadata.weekStart,
          weekEnd: metadata.weekEnd,
          readableDate,
        };
      })
      .sort((a, b) => {
        // Sort by transaction count (descending), then by week key (chronological)
        if (b.transactionCount !== a.transactionCount) {
          return b.transactionCount - a.transactionCount;
        }
        return a.weekKey.localeCompare(b.weekKey);
      });

    // Build time period stats - sorted by transaction count (descending)
    const busiestTimePeriods: TimePeriodStats[] = Array.from(hourCounts.entries())
      .map(([hour, transactionCount]) => {
        // Format hour label: "2:00 PM" or "14:00"
        // Create a new date with the specific hour for formatting
        const hourDate = new Date();
        hourDate.setHours(hour, 0, 0, 0);
        const hourLabel = format(hourDate, "h:mm a");
        
        return {
          hour,
          hourLabel,
          transactionCount,
        };
      })
      .sort((a, b) => {
        // Sort by transaction count (descending), then by hour (ascending)
        if (b.transactionCount !== a.transactionCount) {
          return b.transactionCount - a.transactionCount;
        }
        return a.hour - b.hour;
      });

    // Calculate summary statistics
    const avgTransactionsPerDay =
      windowDays > 0 ? totalTransactions / windowDays : 0;
    const uniqueWeeks = busiestWeeks.length;
    const avgTransactionsPerWeek =
      uniqueWeeks > 0 ? totalTransactions / uniqueWeeks : 0;

    // Build response
    const response: BusiestPeriodResponse = {
      range: {
        startIso,
        endIso,
        windowDays,
      },
      busiestDays,
      busiestWeeks,
      busiestTimePeriods,
      summary: {
        totalTransactions,
        avgTransactionsPerDay,
        avgTransactionsPerWeek,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get busiest period analytics",
      error: (error as Error).message,
    });
  }
};
```

## Route Handler

Add to your analytics router:

```ts
import { getBusiestPeriod } from "@/services/analytics/busiestPeriod";

router.get("/busiest-period", getBusiestPeriod);
```

## Usage Example

### Request
```bash
GET /analytics/busiest-period?startDate=2025-01-01&endDate=2025-01-31
```

### Response Example
```json
{
  "range": {
    "startIso": "2024-12-31T16:00:00.000Z",
    "endIso": "2025-01-31T15:59:59.999Z",
    "windowDays": 31
  },
  "busiestDays": [
    {
      "dayName": "Saturday",
      "dayNumber": 6,
      "transactionCount": 45
    },
    {
      "dayName": "Friday",
      "dayNumber": 5,
      "transactionCount": 38
    },
    {
      "dayName": "Sunday",
      "dayNumber": 0,
      "transactionCount": 35
    },
    {
      "dayName": "Thursday",
      "dayNumber": 4,
      "transactionCount": 28
    },
    {
      "dayName": "Wednesday",
      "dayNumber": 3,
      "transactionCount": 22
    },
    {
      "dayName": "Tuesday",
      "dayNumber": 2,
      "transactionCount": 18
    },
    {
      "dayName": "Monday",
      "dayNumber": 1,
      "transactionCount": 12
    }
  ],
  "busiestWeeks": [
    {
      "weekKey": "2025-W04",
      "year": 2025,
      "weekNumber": 4,
      "transactionCount": 125,
      "weekStart": "2025-01-20T00:00:00.000Z",
      "weekEnd": "2025-01-26T23:59:59.999Z",
      "readableDate": "Jan 20 - Jan 26, 2025"
    },
    {
      "weekKey": "2025-W03",
      "year": 2025,
      "weekNumber": 3,
      "transactionCount": 112,
      "weekStart": "2025-01-13T00:00:00.000Z",
      "weekEnd": "2025-01-19T23:59:59.999Z",
      "readableDate": "Jan 13 - Jan 19, 2025"
    },
    {
      "weekKey": "2025-W02",
      "year": 2025,
      "weekNumber": 2,
      "transactionCount": 95,
      "weekStart": "2025-01-06T00:00:00.000Z",
      "weekEnd": "2025-01-12T23:59:59.999Z",
      "readableDate": "Jan 6 - Jan 12, 2025"
    },
    {
      "weekKey": "2025-W01",
      "year": 2025,
      "weekNumber": 1,
      "transactionCount": 78,
      "weekStart": "2024-12-30T00:00:00.000Z",
      "weekEnd": "2025-01-05T23:59:59.999Z",
      "readableDate": "Dec 30 - Jan 5, 2025"
    }
  ],
  "busiestTimePeriods": [
    {
      "hour": 14,
      "hourLabel": "2:00 PM",
      "transactionCount": 68
    },
    {
      "hour": 15,
      "hourLabel": "3:00 PM",
      "transactionCount": 62
    },
    {
      "hour": 13,
      "hourLabel": "1:00 PM",
      "transactionCount": 58
    },
    {
      "hour": 16,
      "hourLabel": "4:00 PM",
      "transactionCount": 55
    },
    {
      "hour": 12,
      "hourLabel": "12:00 PM",
      "transactionCount": 48
    },
    {
      "hour": 17,
      "hourLabel": "5:00 PM",
      "transactionCount": 42
    },
    {
      "hour": 11,
      "hourLabel": "11:00 AM",
      "transactionCount": 35
    },
    {
      "hour": 18,
      "hourLabel": "6:00 PM",
      "transactionCount": 28
    },
    {
      "hour": 10,
      "hourLabel": "10:00 AM",
      "transactionCount": 22
    },
    {
      "hour": 19,
      "hourLabel": "7:00 PM",
      "transactionCount": 18
    },
    {
      "hour": 9,
      "hourLabel": "9:00 AM",
      "transactionCount": 12
    },
    {
      "hour": 20,
      "hourLabel": "8:00 PM",
      "transactionCount": 8
    },
    {
      "hour": 8,
      "hourLabel": "8:00 AM",
      "transactionCount": 5
    },
    {
      "hour": 21,
      "hourLabel": "9:00 PM",
      "transactionCount": 3
    },
    {
      "hour": 7,
      "hourLabel": "7:00 AM",
      "transactionCount": 2
    },
    {
      "hour": 22,
      "hourLabel": "10:00 PM",
      "transactionCount": 1
    },
    {
      "hour": 0,
      "hourLabel": "12:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 1,
      "hourLabel": "1:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 2,
      "hourLabel": "2:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 3,
      "hourLabel": "3:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 4,
      "hourLabel": "4:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 5,
      "hourLabel": "5:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 6,
      "hourLabel": "6:00 AM",
      "transactionCount": 0
    },
    {
      "hour": 23,
      "hourLabel": "11:00 PM",
      "transactionCount": 0
    }
  ],
  "summary": {
    "totalTransactions": 410,
    "avgTransactionsPerDay": 13.23,
    "avgTransactionsPerWeek": 102.5
  }
}
```

