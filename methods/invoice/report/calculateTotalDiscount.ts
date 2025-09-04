import Transaction from "@/types/Transaction";

const calculateTotalDiscount = (transactions: Transaction[]) => {
  return transactions.reduce((total, transaction) => {
    console.log("transaction", transaction); // log each discount
    return total + transaction.discount;
  }, 0);
};

export default calculateTotalDiscount;
