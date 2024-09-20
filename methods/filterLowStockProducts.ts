import { Product } from "../types/type";

export const filterLowStockProducts = (products: Product[]) => {
  return products.filter(
    (product) => product.lowStockThreshold >= product.stock
  );
};
