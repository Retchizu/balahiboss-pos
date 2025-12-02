import { api } from "@/config/axios-api";
import { firestoreDb } from "@/config/firebaseConfig";
import Product from "@/types/Product";
import { collection, onSnapshot } from "firebase/firestore";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRecentTrasactionContext } from "./RecentTransactionContext";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";

type ProductContextType = {
  products: Record<string, Product>;
  setProducts: Dispatch<SetStateAction<Record<string, Product>>>;
  loading: boolean;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);
  const { setRecentTranscations } = useRecentTrasactionContext();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestoreDb, "products"),
      async (snapshot) => {
        setLoading(true);
        const data: Record<string, Product> = {};
        snapshot.docs.forEach((doc) => {
          data[doc.id] = doc.data() as Product;
        });
        setProducts(data);

        const getRecentTransaction = async () => {
          try {
            const response = await api.get("/transaction/list");
            setRecentTranscations(response.data.items);
          } catch (error) {
            if (isAxiosError(error))
              Toast.show({
                type: "error",
                text1: `${error.response?.data.message}`,
              });
          }
        };
        await getRecentTransaction();
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setProducts, setRecentTranscations]);

  return (
    <ProductContext.Provider value={{ products, setProducts,loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("ProductContext must be used within ProductProvider");
  }
  return context;
};
