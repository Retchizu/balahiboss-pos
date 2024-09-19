import { createContext, ReactNode, useContext, useState } from "react";
import { SelectedProduct } from "../types/type";

type SelectedProductInEditContextType = {
  selectedProductsInEdit: SelectedProduct[];
  addSelectedProductInEdit: (newProduct: SelectedProduct) => void;
  updateSelectedProductInEdit: (
    productId: String,
    attribute: Partial<SelectedProduct>
  ) => void;
  setSelectedProductListInEdit: (newProductList: SelectedProduct[]) => void;
};

const SelectedProductInEditContext = createContext<
  SelectedProductInEditContextType | undefined
>(undefined);

export const SelectedProductInEditProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selectedProductsInEdit, setSelectedProductsInEdit] = useState<
    SelectedProduct[]
  >([]);

  const addSelectedProductInEdit = (newSelectedProduct: SelectedProduct) => {
    setSelectedProductsInEdit((prevSelectedProducts) => [
      ...prevSelectedProducts,
      newSelectedProduct,
    ]);
  };
  const updateSelectedProductInEdit = (
    productId: String,
    attribute: Partial<SelectedProduct>
  ) => {
    setSelectedProductsInEdit((prevSelectedProducts) =>
      prevSelectedProducts.map((product) =>
        product.id === productId ? { ...product, ...attribute } : product
      )
    );
  };
  const setSelectedProductListInEdit = (
    newSelectedProductList: SelectedProduct[]
  ) => {
    setSelectedProductsInEdit(newSelectedProductList);
  };

  return (
    <SelectedProductInEditContext.Provider
      value={{
        selectedProductsInEdit,
        addSelectedProductInEdit,
        setSelectedProductListInEdit,
        updateSelectedProductInEdit,
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
