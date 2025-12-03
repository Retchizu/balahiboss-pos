import Product from "@/types/Product";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProductContextType = {
  products: Record<string, Product>;
  setProducts: Dispatch<SetStateAction<Record<string, Product>>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  initialized: boolean;
};
const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { setRecentTranscations } = useRecentTrasactionContext();
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setToken(token);
        }
      } catch (error) {
        console.error("Failed to fetch token from storage", error);
      }
    };

    fetchToken();
  }, [token]);

  useEffect(() => {
    const getProducts = async () => {
      if (!token || token.length <= 0) return;
      try {
        const response = await api.get("/product/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data.items);
      } catch (error) {
        // Handle errors (e.g., network, expired token, or unauthenticated)
        if (isAxiosError(error) && error.response?.status !== 401) {
          Toast.show({
            type: "error",
            text1:
              `${error.response?.data?.error}` || "Failed to load products",
          });
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getProducts();
  }, [token]);

  useEffect(() => {
    const loadRecent = async () => {
      if (!token || token.length <= 0) return;
      try {
        const response = await api.get("/transaction/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [setRecentTranscations, products, token]);

  return (
    <ProductContext.Provider
      value={{ products, setProducts, loading, setLoading, initialized }}
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
