import { Product, SelectedProduct } from "../../types/type";

export const setProductListInEditScreen = (
  setProductListInEdit: (newProductList: Product[]) => void,
  products: Product[],
  selectedProductsInEdit: SelectedProduct[]
) => {
  setProductListInEdit(
    products.map((product) => {
      const getSelectedProduct = selectedProductsInEdit.find(
        (selectedProduct) => selectedProduct.id === product.id
      );

      return product.id === getSelectedProduct?.id
        ? { ...product, stock: product.stock + getSelectedProduct.quantity }
        : product;
    })
  );
};
