import Transaction from "@/types/Transaction";

const calculateTotalCashPayment = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => total + transaction.cashPayment, 0);
};

export default calculateTotalCashPayment;