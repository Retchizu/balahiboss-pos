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
import { api } from "@/config/axios-api";

type ProductContextType = {
  products: Record<string, Product>;
  setProducts: Dispatch<SetStateAction<Record<string, Product>>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};
const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const { setRecentTranscations } = useRecentTrasactionContext();

  useEffect(() => {

    const getProducts = async () => {
      try {
        const response = await api.get("/product/list");
        setProducts(response.data.items);
      } catch (error) {
        // Handle errors (e.g., network, expired token, or unauthenticated)
        if (isAxiosError(error) && error.response?.status !== 401) {
          Toast.show({
            type: "error",
            text1: error.response?.data?.error || "Failed to load products",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const response = await api.get("/transaction/list");

        setRecentTranscations(response.data.items);
      } catch (error) {
        // Handle errors (e.g., network, expired token, or unauthenticated)
        if (isAxiosError(error) && error.response?.status !== 401) {
          Toast.show({
            type: "error",
            text1: error.response?.data?.error || "Failed to load transactions",
          });
        }
      }
    };

    loadRecent();
  }, [setRecentTranscations, products]);

  useEffect(() => {
    const productsCollection = collection(firestoreDb, "products");

    const unsubscribe = onSnapshot(
      productsCollection,
      (snapshot) => {
        const data: Record<string, Product> = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data() as Product;
        });
        setProducts(data); // lightweight, no network
      },
      (error) => {
        console.error("products listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <ProductContext.Provider
      value={{ products, setProducts, loading, setLoading }}
    >
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
