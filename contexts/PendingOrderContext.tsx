import PendingOrder from "@/types/PendingOrder";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type PendingOrderContextType = {
  orders: Record<string, PendingOrder>;
  setOrders: Dispatch<SetStateAction<Record<string, PendingOrder>>>;
};

const PendingOrderContext = createContext<PendingOrderContextType | undefined>(
  undefined
);

export const PendingOrderProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Record<string, PendingOrder>>({});
  return (
    <PendingOrderContext.Provider value={{ orders, setOrders }}>
      {children}
    </PendingOrderContext.Provider>
  );
};

export const usePendingOrderContext = (): PendingOrderContextType => {
  const context = useContext(PendingOrderContext);
  if (!context) {
    throw new Error(
      "PendingOrderContext must be used within PendingOrderProvider"
    );
  }
  return context;
};
