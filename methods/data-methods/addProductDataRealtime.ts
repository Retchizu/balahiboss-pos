import { ToastType } from "react-native-toast-message";
import { Product, User } from "../../types/type";
import { push, ref, set } from "firebase/database";
import { realTimeDb } from "../../firebaseConfig";
import React from "react";

export const addProductDataRealtime = async (
  productInfo: {
    productName: string;
    sellPrice: string;
    stockPrice: string;
    lowStockThreshold: string;
  },
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null,
  setToggleToast: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    if (
      productInfo.productName.trim() &&
      productInfo.sellPrice.trim() &&
      productInfo.lowStockThreshold.trim()
    ) {
      const productRef = ref(realTimeDb, `users/${user?.uid}/products`);
      const productRefAutoID = push(productRef);

      await set(productRefAutoID, {
        productName: productInfo.productName,
        stockPrice: parseFloat(productInfo.stockPrice),
        sellPrice: parseFloat(productInfo.sellPrice),
        lowStockThreshold: parseFloat(productInfo.lowStockThreshold),
        stock: 0,
      });
      setToggleToast((prev) => prev + 1);
      showToast(
        "success",
        "Product Added",
        `Successfully added product "${productInfo.productName}"`
      );
    } else {
      showToast("error", "Please Complete Missing Fields");
    }
  } catch (error) {
    showToast("error", "Error Occured", "Try again later");
  }
};
