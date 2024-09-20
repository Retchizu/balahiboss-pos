import { Product } from "../../types/type";

export const calculateTotalStockAmount = (product: Product) => {
  return product.stockPrice * product.stock;
};
