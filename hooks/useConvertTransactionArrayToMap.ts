import { useRecentTrasactionContext } from "@/contexts/RecentTransactionContext";
import { useTransactionContext } from "@/contexts/TransactionContext";
import Transaction from "@/types/Transaction";

export const useConvertTransactionArrayToMap = (fromRecentScreen: boolean) => {
  const { transactions } = useTransactionContext();
  const { recentTransactions } = useRecentTrasactionContext();

  // check which transaction is from 2 transaction screens
  const transactionList = fromRecentScreen === false? transactions : recentTransactions;

  const transactionMap: Record<string, Transaction> = transactionList.reduce(
    (map, transaction) => {
      map[transaction.id] = transaction;
      return map;
    },
    {} as Record<string, Transaction>
  );

  return { transactionMap };
};
