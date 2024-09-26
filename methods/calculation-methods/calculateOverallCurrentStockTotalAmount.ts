import { Product } from "../../types/type";
import { calculateTotalStockAmount } from "./calculateTotalStockAmount";

export const calculateOverallCurrentStockTotalAmount = (
  products: Product[]
) => {
  let total = 0;
  products.forEach((product) => {
    total += calculateTotalStockAmount(product);
  });
  return total;
};
