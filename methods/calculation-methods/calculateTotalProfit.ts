import { SelectedProduct } from "../../types/type";

export const calculateTotalProfit = (
  selectedProducts: SelectedProduct[],
  discount?: number,
  freebies?: number
) => {
  let total = 0;
  if (selectedProducts.length === 0) return 0;

  selectedProducts.forEach((selectedProduct) => {
    total +=
      (selectedProduct.sellPrice - selectedProduct.stockPrice) *
      selectedProduct.quantity;
  });

  total = total - (discount ?? 0) - (freebies ?? 0);

  return total;
};