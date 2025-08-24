import Transaction from "@/types/Transaction";

const calculateTotalDiscount = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => total + transaction.discount, 0);
};

export default calculateTotalDiscount;
