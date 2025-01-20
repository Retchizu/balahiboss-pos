import { SelectedProduct } from "../../types/type";

export const calculateTotalPriceForSummary = (
  selectedProducts: Map<string, SelectedProduct>,
  discount?: number
) => {
  let total = 0;
  selectedProducts.forEach((selectedProduct) => {
    const calculatePrice = selectedProduct.sellPrice * selectedProduct.quantity;
    total += calculatePrice;
  });
  if (discount) total -= discount;
  return total;
};
