import { Product, SelectedProduct } from "../../types/type";

export const selectProduct = (
  item: Product,
  addSelectedProduct: (newProduct: SelectedProduct) => void,
  selectedProducts: SelectedProduct[],
  setSelectedProductList: (newProductList: SelectedProduct[]) => void
) => {
  if (
    !selectedProducts.some((selectedProduct) => selectedProduct.id === item.id)
  ) {
    addSelectedProduct({ ...item, quantity: item.stock === 0.5 ? 0.5 : 1 });
  } else {
    setSelectedProductList(
      selectedProducts.filter((product) => product.id !== item.id)
    );
  }
};
