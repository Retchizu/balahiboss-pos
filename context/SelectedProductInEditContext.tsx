import { createContext, ReactNode, useContext, useState } from "react";
import { SelectedProduct } from "../types/type";

type SelectedProductInEditContextType = {
  selectedProductsInEdit: Map<string, SelectedProduct>;
  addSelectedProductInEdit: (newProduct: SelectedProduct) => void;
  updateSelectedProductInEdit: (
    productId: string,
    attribute: Partial<SelectedProduct>
  ) => void;
  deleteSelectedProductInEdit: (productId: string) => void;
  setSelectedProductListInEdit: (
    newProductList: Map<string, SelectedProduct>
  ) => void;
};

const SelectedProductInEditContext = createContext<
  SelectedProductInEditContextType | undefined
>(undefined);

export const SelectedProductInEditProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selectedProductsInEdit, setSelectedProductsInEdit] = useState<
    Map<string, SelectedProduct>
  >(new Map());

  const addSelectedProductInEdit = (newSelectedProduct: SelectedProduct) => {
    setSelectedProductsInEdit((prevSelectedProducts) => {
      const currentMap = new Map(prevSelectedProducts);
      currentMap.set(newSelectedProduct.id, newSelectedProduct);
      return currentMap;
    });
  };

  const updateSelectedProductInEdit = (
    productId: string,
    attribute: Partial<SelectedProduct>
  ) => {
    setSelectedProductsInEdit((prevSelectedProducts) => {
      const currentMap = new Map(prevSelectedProducts);
      const existingProduct = currentMap.get(productId);
      if (existingProduct) {
        currentMap.set(productId, { ...existingProduct, ...attribute });
      }
      return currentMap;
    });
  };

  const deleteSelectedProductInEdit = (productId: string) => {
    setSelectedProductsInEdit((prevSelectedProducts) => {
      const currentMap = new Map(prevSelectedProducts);
      currentMap.delete(productId);
      return currentMap;
    });
  };

  const setSelectedProductListInEdit = (
    newSelectedProductList: Map<string, SelectedProduct>
  ) => {
    setSelectedProductsInEdit(newSelectedProductList);
  };

  return (
    <SelectedProductInEditContext.Provider
      value={{
        selectedProductsInEdit,
        addSelectedProductInEdit,
        updateSelectedProductInEdit,
        deleteSelectedProductInEdit,
        setSelectedProductListInEdit,
      }}
    >
      {children}
    </SelectedProductInEditContext.Provider>
  );
};

export const useSelectedProductInEditContext =
  (): SelectedProductInEditContextType => {
    const context = useContext(SelectedProductInEditContext);
    if (!context) {
      throw new Error(
        "useSelectedProductInEditContext must be used within a SelectedProductInEditProvider"
      );
    }
    return context;
  };
