import { Timesheet } from "@/types/Timesheet";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type TimesheetInfo = {
  timesheets: Timesheet[];
  rate: number;
};
type TimesheetContextType = {
  timesheetInfo: TimesheetInfo | undefined;
  setTimesheetInfo: Dispatch<SetStateAction<TimesheetInfo | undefined>>;
  updateSingleTimesheet: (id: string, updates: Partial<Timesheet>) => void
};

const TimesheetContext = createContext<TimesheetContextType | undefined>(
  undefined
);
export const useTimesheetContext = () => {
  const context = useContext(TimesheetContext);
  if (!context) {
    throw new Error(
      "useTimesheetContext must be used within a TimesheetProvider"
    );
  }
  return context;
};

export const TimesheetProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [timesheetInfo, setTimesheetInfo] = useState<TimesheetInfo | undefined>(
    {
      timesheets: [],
      rate: 0,
    }
  );

  const updateSingleTimesheet = (id: string, updates: Partial<Timesheet>) => {
    setTimesheetInfo((prev) => {
      if (!prev) return prev;

      const updatedTimesheets = prev.timesheets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );

      return { ...prev, timesheets: updatedTimesheets };
    });
  };
  return (
    <TimesheetContext.Provider value={{ timesheetInfo, setTimesheetInfo, updateSingleTimesheet }}>
      {children}
    </TimesheetContext.Provider>
  );
};
