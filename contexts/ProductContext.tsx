import Product from "@/types/Product"
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from "react";

type ProductContextType = {
    products: Record<string, Product>;
    setProducts: Dispatch<SetStateAction<Record<string, Product>>>;
  };

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Record<string, Product>>({});
  
    return (
      <ProductContext.Provider value={{ products, setProducts }}>
        {children}
      </ProductContext.Provider>
    );
  };

export const useProductContext = (): ProductContextType => {
    const context = useContext(ProductContext);
    if(!context){
        throw new Error("ProductContext must be used within ProductProvider");
    }
    return context;
}
