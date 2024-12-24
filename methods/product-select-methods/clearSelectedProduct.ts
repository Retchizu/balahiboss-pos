import { SelectedProduct } from "../../types/type";

export const clearSelectedProduct = (
  setSelectedProducts: (
    newSelectedProductList: Map<string, SelectedProduct>
  ) => void
) => {
  setSelectedProducts(new Map());
};
