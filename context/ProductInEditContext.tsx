import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../types/type";

type ProductInEditContext = {
  productsInEdit: Product[];
  addProductInEdit: (newProduct: Product) => void;
  updateProductInEdit: (productId: String, attribute: Partial<Product>) => void;
  setProductListInEdit: (newProductList: Product[]) => void;
};

const ProductInEditContext = createContext<ProductInEditContext | undefined>(
  undefined
);

export const ProductInEditProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [productsInEdit, setProducts] = useState<Product[]>([]);

  const addProductInEdit = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };
  const updateProductInEdit = (
    productId: String,
    attribute: Partial<Product>
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, ...attribute } : product
      )
    );
  };
  const setProductListInEdit = (newProductList: Product[]) => {
    setProducts(newProductList);
  };

  return (
    <ProductInEditContext.Provider
      value={{
        productsInEdit,
        addProductInEdit,
        updateProductInEdit,
        setProductListInEdit,
      }}
    >
      {children}
    </ProductInEditContext.Provider>
  );
};

export const useProductInEditContext = (): ProductInEditContext => {
  const context = useContext(ProductInEditContext);
  if (!context) {
    throw new Error(
      "useProductInEditContext must be used within a ProductInEditProvider"
    );
  }
  return context;
};
