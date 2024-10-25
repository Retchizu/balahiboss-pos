import { ToastType } from "react-native-toast-message";
import { Product, User } from "../../types/type";
import { ref, set } from "firebase/database";
import { realTimeDb } from "../../firebaseConfig";

export const updateProductDataRealtime = async (
  productInfo: Product,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    const productRef = ref(
      realTimeDb,
      `users/${user?.uid}/products/${productInfo.id}`
    );

    await set(productRef, {
      productName: productInfo.productName,
      stockPrice: productInfo.stockPrice,
      sellPrice: productInfo.sellPrice,
      stock: productInfo.stock,
      lowStockThreshold: productInfo.lowStockThreshold,
    });
    showToast("success", "Product updated successfully");
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
