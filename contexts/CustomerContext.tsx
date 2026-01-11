import { api } from "@/config/axios-api";
import Customer from "@/types/Customer";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type CustomerContextType = {
  customers: Record<string, Customer>;
  setCustomers: Dispatch<SetStateAction<Record<string, Customer>>>;
};

const customerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export const CustomerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Record<string, Customer>>({});

  return (
    <customerContext.Provider value={{ customers, setCustomers }}>
      {children}
    </customerContext.Provider>
  );
};

export const useCustomerContext = (): CustomerContextType => {
  const context = useContext(customerContext);
  if (!context) {
    throw new Error("CustomerContext must be used within CustomerProvider");
  }
  return context;
};
