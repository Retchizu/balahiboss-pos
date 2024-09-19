import { createContext, ReactNode, useContext, useState } from "react";
import { SelectedProduct } from "../types/type";

type SelectedProductContextType = {
  selectedProducts: SelectedProduct[];
  addSelectedProduct: (newProduct: SelectedProduct) => void;
  updateSelectedProduct: (
    productId: String,
    attribute: Partial<SelectedProduct>
  ) => void;
  setSelectedProductList: (newProductList: SelectedProduct[]) => void;
};

const SelectedProductContext = createContext<
  SelectedProductContextType | undefined
>(undefined);

export const SelectedProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const addSelectedProduct = (newSelectedProduct: SelectedProduct) => {
    setSelectedProducts((prevSelectedProducts) => [
      ...prevSelectedProducts,
      newSelectedProduct,
    ]);
  };
  const updateSelectedProduct = (
    productId: String,
    attribute: Partial<SelectedProduct>
  ) => {
    setSelectedProducts((prevSelectedProducts) =>
      prevSelectedProducts.map((product) =>
        product.id === productId ? { ...product, ...attribute } : product
      )
    );
  };
  const setSelectedProductList = (
    newSelectedProductList: SelectedProduct[]
  ) => {
    setSelectedProducts(newSelectedProductList);
  };

  return (
    <SelectedProductContext.Provider
      value={{
        selectedProducts,
        addSelectedProduct,
        updateSelectedProduct,
        setSelectedProductList,
      }}
    >
      {children}
    </SelectedProductContext.Provider>
  );
};

export const useSelectedProductContext = (): SelectedProductContextType => {
  const context = useContext(SelectedProductContext);
  if (!context) {
    throw new Error(
      "useSelectedProductContext must be used within a SelectedProductProvider"
    );
  }
  return context;
};
