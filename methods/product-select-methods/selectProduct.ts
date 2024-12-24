import { Product, SelectedProduct } from "../../types/type";

export const selectProduct = (
  item: Product,
  addSelectedProduct: (newProduct: SelectedProduct) => void,
  selectedProducts: Map<string, SelectedProduct>,
  deleteSelectedProduct: (productId: string) => void
) => {
  if (!selectedProducts.has(item.id)) {
    addSelectedProduct({ ...item, quantity: item.stock === 0.5 ? 0.5 : 1 });
  } else {
    deleteSelectedProduct(item.id);
  }
};
