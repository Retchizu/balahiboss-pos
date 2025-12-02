import { api } from "@/config/axios-api";
import { firestoreDb } from "@/config/firebaseConfig";
import Customer from "@/types/Customer";
import { collection, onSnapshot } from "firebase/firestore";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "customers"),
      async (snapshot) => {
        const response = await api.get("/customer/list");
        setCustomers(response.data.items);
      }
    );
    return () => unsubscribe();
  }, [setCustomers]);

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
