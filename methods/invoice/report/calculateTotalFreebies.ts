import Transaction from "@/types/Transaction";

const calculateTotalFreebies = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => total + transaction.freebies, 0);
};

export default calculateTotalFreebies;
