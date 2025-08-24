import { ActivityLog } from "@/types/Activity";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type ActivityContextType = {
  activities: ActivityLog;
  setActivities: Dispatch<SetStateAction<ActivityLog>>;
};

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const ActivityProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityLog>([]);
  return (
    <ActivityContext.Provider value={{ activities, setActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = (): ActivityContextType => {
  const context = useContext(ActivityContext);

  if (!context) {
    throw new Error("ActivityContext must be used withing ActivityProvider");
  }
  return context;
};
