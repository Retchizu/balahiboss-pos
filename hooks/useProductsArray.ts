import Product from "@/types/Product";
import { useMemo } from "react";

const useProductsArray = (products?: Record<string, Product>) => {
  const productsArray = useMemo(() => {
    if (!products || Object.keys(products).length === 0) {
      return [];
    }

    return Object.entries(products)
      .map(([id, product]) => ({
        ...product,
        id,
      }))
      .sort((a, b) => a.productName.localeCompare(b.productName)); // Alphabetical
  }, [products]);

  return { productsArray };
};
export default useProductsArray;