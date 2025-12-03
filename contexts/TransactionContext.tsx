import { api } from "@/config/axios-api";
import Transaction from "@/types/Transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";

type TransactionContextType = {
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  startDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: Dispatch<SetStateAction<Date | null>>;
  loading: boolean;
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const TransactionProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to fetch token from storage", error);
      }
    };

    fetchToken();
  }, [token]);

  const getTransactions = useCallback(async () => {
    if (!token || token.length <= 0) return;
    setLoading(true);
    try {
      const response = await api.get("/transaction/list", {
        params: {
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.items);
      setTransactions(response.data.items);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error("Get Transaction Failed: ", error);
    } finally {
      setLoading(false)
    }
  }, [token, startDate, endDate]);

  /* useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "transactions"),
      async (snapshot) => {
        await getTransactions();
      }
    );

    return () => unsubscribe();
  }, [getTransactions]);
 */

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);
  return (
    <TransactionContext.Provider
      value={{
        setTransactions,
        transactions,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      "TransactionContext must be used within TransactionProvider"
    );
  }

  return context;
};
