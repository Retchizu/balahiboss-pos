import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../types/type";

type ProductContextType = {
  products: Product[];
  addProduct: (newProduct: Product) => void;
  updateProduct: (productId: String, attribute: Partial<Product>) => void;
  setProductList: (newProductList: Product[]) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };
  const updateProduct = (productId: String, attribute: Partial<Product>) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, ...attribute } : product
      )
    );
  };
  const setProductList = (newProductList: Product[]) => {
    setProducts(newProductList);
  };

  return (
    <ProductContext.Provider
      value={{ products, addProduct, updateProduct, setProductList }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
