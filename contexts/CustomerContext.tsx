import { api } from "@/config/axios-api";
import Customer from "@/types/Customer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
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
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setToken(token);
        }
      } catch (error) {
        console.error("Failed to fetch token from storage", error);
      }
    };

    fetchToken();
  }, [token]);
  useEffect(() => {
    const getCustomers = async () => {
      if(!token || token.length <= 0) return;
      try {
        const response = await api.get("/customer/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCustomers(response.data.items);
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({
            type: "error",
            text1: `${error.response?.data?.error}` || "Failed to load customers",
          });
        }
      }
    };

    getCustomers();
  }, [token]);

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
