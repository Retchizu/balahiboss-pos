# Simplified Type Definitions: Busiest Period Analytics

## File: `src/types/metrics/BusiestPeriod.ts`

```ts
export type DayOfWeekStats = {
  dayName: string;        // "Sunday", "Monday", etc.
  dayNumber: number;      // 0-6 (0=Sunday, 6=Saturday)
  transactionCount: number;
};

export type WeekStats = {
  weekKey: string;        // "2025-W01"
  year: number;
  weekNumber: number;
  transactionCount: number;
  weekStart: string;      // ISO date of week start (Monday)
  weekEnd: string;        // ISO date of week end (Sunday)
  readableDate: string;   // Human-readable format: "Jan 20 - Jan 26, 2025"
};

export type TimePeriodStats = {
  hour: number;           // 0-23 (24-hour format)
  hourLabel: string;      // Human-readable: "2:00 PM" or "14:00"
  transactionCount: number;
};

export type BusiestPeriodResponse = {
  range: {
    startIso: string;
    endIso: string;
    windowDays: number;
  };
  busiestDays: DayOfWeekStats[];  // All 7 days ranked by transaction count (descending)
  busiestWeeks: WeekStats[];      // All weeks ranked by transaction count (descending)
  busiestTimePeriods: TimePeriodStats[];  // All 24 hours ranked by transaction count (descending)
  summary: {
    totalTransactions: number;
    avgTransactionsPerDay: number;
    avgTransactionsPerWeek: number;
  };
};
```

