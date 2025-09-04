import Transaction from "@/types/Transaction";
import Product from "@/types/Product";

const calculateTotalProfit = (
  transactions: Transaction[],
  products: Record<string, Product>
) => {
  return transactions.reduce((total, transaction) => {
    const transactionProfit = transaction.items.reduce((sum, item) => {
      const product = products[item.productId];
      if (!product) return sum; // skip if product not found
      const profitPerItem = product.sellPrice - product.stockPrice;
      return sum + profitPerItem * item.quantity;
    }, 0);
    return total + transactionProfit - transaction.discount - transaction.freebies;
  }, 0);
};

export default calculateTotalProfit;
