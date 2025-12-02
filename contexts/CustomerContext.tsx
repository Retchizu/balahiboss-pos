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
      (snapshot) => {
        const data: Record<string, Customer> = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data() as Customer;
        });
        setCustomers(data);
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
