import { Timesheet } from "@/types/Timesheet";
import { TimesheetInfo } from "@/types/TimesheetInfo";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type TimesheetContextType = {
  timesheetInfo: TimesheetInfo | undefined;
  setTimesheetInfo: Dispatch<SetStateAction<TimesheetInfo | undefined>>;
  updateSingleTimesheet: (id: string, updates: Partial<Timesheet>) => void;
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
    undefined
  );

  const updateSingleTimesheet = (id: string, updates: Partial<Timesheet>) => {
    setTimesheetInfo((prev) => {
      if (!prev) return prev;

      const updatedTimesheets = prev.timesheets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );

      return { rate: prev.rate, timesheets: updatedTimesheets };
    });
  };
  return (
    <TimesheetContext.Provider
      value={{ timesheetInfo, setTimesheetInfo, updateSingleTimesheet }}
    >
      {children}
    </TimesheetContext.Provider>
  );
};
