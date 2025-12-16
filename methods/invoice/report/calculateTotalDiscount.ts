import Transaction from "@/types/Transaction";

const calculateTotalDiscount = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => {
    return total + transaction.discount;
  }, 0);
};

export default calculateTotalDiscount;
