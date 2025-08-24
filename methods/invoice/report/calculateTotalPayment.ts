import Transaction from "@/types/Transaction";

const calculateTotalPayment = (transactions: Transaction[]) => {
  return transactions.reduce(
    (total, transaction) => total + transaction.cashPayment + transaction.onlinePayment,
    0
  );
};

export default calculateTotalPayment;
