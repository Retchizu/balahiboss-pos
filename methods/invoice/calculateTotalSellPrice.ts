import SelectedProduct from "@/types/SelectedProduct";

const calculateTotalSellPrice = (
  selectedProducts: SelectedProduct[],
  discount?: string
) => {
  const total = selectedProducts.reduce((sum, product) => {
    return sum + product.sellPrice * product.quantity;
  }, 0);

  const parsedDiscount = discount ? parseFloat(discount) : 0;

  return total - parsedDiscount;
};

export default calculateTotalSellPrice;
