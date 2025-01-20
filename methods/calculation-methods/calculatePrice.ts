import { SelectedProduct } from "../../types/type";

export const calculatePrice = (item: SelectedProduct) => {
  return item.sellPrice * item.quantity;
};
