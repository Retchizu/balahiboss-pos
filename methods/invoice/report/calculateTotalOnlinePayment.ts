import Transaction from "@/types/Transaction";

const calculateTotalOnlinePayment = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => total + transaction.onlinePayment, 0);
};

export default calculateTotalOnlinePayment;
