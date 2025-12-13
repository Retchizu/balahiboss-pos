import { api } from "@/config/axios-api";
import Transaction from "@/types/Transaction";
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
import { useProductContext } from "./ProductContext";

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
  const {products} = useProductContext();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const getTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/transaction/list", {
        params: {
          startDate,
          endDate,
        }
      });
      setTransactions(response.data.items);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error("Get Transaction Failed: ", error);
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, products]);

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
