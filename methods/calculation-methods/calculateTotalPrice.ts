import { SelectedProduct } from "../../types/type";

export const calculateTotalPrice = (
  selectedProducts: SelectedProduct[],
  deliveryFee?: number,
  discount?: number
) => {
  let total = 0;
  selectedProducts.forEach((selectedProduct) => {
    const calculatePrice = selectedProduct.sellPrice * selectedProduct.quantity;
    total += calculatePrice;
  });
  if (deliveryFee) total += deliveryFee;
  if (discount) total -= discount;
  return total;
};
