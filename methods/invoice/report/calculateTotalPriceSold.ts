import Transaction from "@/types/Transaction";
import Product from "@/types/Product";

const calculateTotalPriceSold = (
  transactions: Transaction[],
  products: Record<string, Product>
) => {
  return transactions.reduce((total, transaction) => {
    const transactionTotal = transaction.items.reduce((sum, item) => {
      const product = products[item.productId];
      return sum + (product?.sellPrice || 0) * item.quantity;
    }, 0);
    return total + transactionTotal;
  }, 0);
};

export default calculateTotalPriceSold;
