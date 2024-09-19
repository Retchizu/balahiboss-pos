import { SelectedProduct } from "../../types/type";

export const deleteSelectedProduct = (
  setSelectedProducts: (product: SelectedProduct[]) => void
) => {
  setSelectedProducts([]);
};
