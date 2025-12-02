import { api } from "@/config/axios-api";
import { firestoreDb } from "@/config/firebaseConfig";
import Customer from "@/types/Customer";
import { isAxiosError } from "axios";
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
import Toast from "react-native-toast-message";

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
    const getCustomers = async () => {
      try {
        const response = await api.get("/customer/list");
        setCustomers(response.data.items);
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({
            type: "error",
            text1: error.response?.data?.error || "Failed to load customers",
          });
        }
      }
    };

    getCustomers();
  }, []);

  useEffect(() => {
    const customersCollection = collection(firestoreDb, "customers");

    const unsubscribe = onSnapshot(
      customersCollection,
      (snapshot) => {
        const data: Record<string, Customer> = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data() as Customer;
        });
        setCustomers(data);
      },
      (error) => {
        console.error("customers listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

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
