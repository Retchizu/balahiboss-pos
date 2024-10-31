import { realTimeDb } from "../../firebaseConfig";
import { ToastType } from "react-native-toast-message";
import { Product, User } from "../../types/type";
import { ref, set } from "firebase/database";
import React from "react";

export const handleBuyStock = async (
  stockToBuy: number,
  products: Product[],
  id: string,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null,
  setToggleToast: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    if (isNaN(stockToBuy)) {
      setToggleToast((prev) => prev + 1);
      showToast("error", "Stock value required", "Can not buy stock");
      return;
    } else {
      const getProductToUpdate = products.find((product) => product.id === id);
      if (getProductToUpdate) {
        const productRef = ref(
          realTimeDb,
          `users/${user?.uid}/products/${getProductToUpdate.id}/stock`
        );
        await set(productRef, getProductToUpdate.stock + stockToBuy);
        showToast("success", "Stock added successfully");
        setToggleToast((prev) => prev + 1);
      }
    }
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
