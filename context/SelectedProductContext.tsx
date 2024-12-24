import { createContext, ReactNode, useContext, useState } from "react";
import { SelectedProduct } from "../types/type";

type SelectedProductContextType = {
  selectedProducts: Map<string, SelectedProduct>;
  addSelectedProduct: (newProduct: SelectedProduct) => void;
  updateSelectedProduct: (
    productId: string,
    attribute: Partial<SelectedProduct>
  ) => void;
  deleteSelectedProduct: (productId: string) => void;
  setSelectedProductList: (
    newSelectedProductList: Map<string, SelectedProduct>
  ) => void;
};

const SelectedProductContext = createContext<
  SelectedProductContextType | undefined
>(undefined);

export const SelectedProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<
    Map<string, SelectedProduct>
  >(new Map());

  const addSelectedProduct = (newSelectedProduct: SelectedProduct) => {
    setSelectedProducts((prevSelectedProducts) => {
      const currentMap = new Map(prevSelectedProducts);
      currentMap.set(newSelectedProduct.id, newSelectedProduct);
      return currentMap;
    });
  };
  const updateSelectedProduct = (
    productId: string,
    attribute: Partial<SelectedProduct>
  ) => {
    setSelectedProducts((prevSelectedProducts) => {
      const currentMap = new Map(prevSelectedProducts);
      const existingProduct = currentMap.get(productId);
      if (existingProduct) {
        currentMap.set(productId, { ...existingProduct, ...attribute });
      }

      return currentMap;
    });
  };

  const deleteSelectedProduct = (productId: string) => {
    setSelectedProducts((prevSelectedProducts) => {
      const currentMap = new Map<string, SelectedProduct>(prevSelectedProducts);
      currentMap.delete(productId);
      return currentMap;
    });
  };

  const setSelectedProductList = (
    newSelectedProductList: Map<string, SelectedProduct>
  ) => {
    setSelectedProducts(newSelectedProductList);
  };

  return (
    <SelectedProductContext.Provider
      value={{
        selectedProducts,
        addSelectedProduct,
        updateSelectedProduct,
        deleteSelectedProduct,
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
