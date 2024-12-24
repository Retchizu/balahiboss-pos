import { createContext, ReactNode, useContext, useState } from "react";
import { Product } from "../types/type";

type CurrentProductContextType = {
  currentProduct: Product | null;
  setCurrentProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  updateCurrentProduct: (attribute: Partial<Product>) => void;
};

const CurrentProductContext = createContext<
  CurrentProductContextType | undefined
>(undefined);

export const CurrentProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const updateCurrentProduct = (attribute: Partial<Product>) => {
    setCurrentProduct((prev) => ({ ...prev!, ...attribute }));
  };
  return (
    <CurrentProductContext.Provider
      value={{ currentProduct, setCurrentProduct, updateCurrentProduct }}
    >
      {children}
    </CurrentProductContext.Provider>
  );
};

export const useCurrentProductContext = (): CurrentProductContextType => {
  const context = useContext(CurrentProductContext);
  if (!context) {
    throw new Error(
      "CurrentProductContext must be used within a CurrentProductProvider"
    );
  }
  return context;
};
