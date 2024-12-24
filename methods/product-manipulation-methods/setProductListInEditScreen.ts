import { Product, SelectedProduct } from "../../types/type";

export const setProductListInEditScreen = (
  setProductListInEdit: (newProductList: Product[]) => void,
  products: Product[],
  selectedProductsInEdit: Map<string, SelectedProduct>
) => {
  setProductListInEdit(
    products.map((product) => {
      const getSelectedProduct = selectedProductsInEdit.get(product.id);

      return product.id === getSelectedProduct?.id
        ? { ...product, stock: product.stock + getSelectedProduct.quantity }
        : product;
    })
  );
};
