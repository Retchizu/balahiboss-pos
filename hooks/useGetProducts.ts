import { api } from "@/config/axios-api";
import { db } from "@/config/firebaseConfig";
import { useProductContext } from "@/contexts/ProductContext";
import { useRecentTrasactionContext } from "@/contexts/RecentTransactionContext";
import { isAxiosError } from "axios";
import { onValue, ref } from "firebase/database";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

const useGetProducts = () => {
  const { setProducts, products } = useProductContext();
  const { setRecentTranscations } = useRecentTrasactionContext();

  useEffect(() => {
    const productRef = ref(db, "products");
    const unsubscribe = onValue(productRef, async (snapshot) => {
      setProducts(snapshot.val());

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
    });

    return () => unsubscribe();
  }, [setProducts, setRecentTranscations]);

  return { products };
};

export default useGetProducts;
