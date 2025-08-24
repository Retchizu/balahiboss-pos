import SelectedProduct from "@/types/SelectedProduct";
import { useMemo } from "react";


export const useSelectedProductsArray = (selectedProducts: Map<string, SelectedProduct>) => {
  
    const selectedProductArray = useMemo(
      () =>
        Array.from(selectedProducts.entries()).map(([id, product]) => ({
          ...product,
          id,
        })),
      [selectedProducts]
    );
  
    return {selectedProductArray};
  };