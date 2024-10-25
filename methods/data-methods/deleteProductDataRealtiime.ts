import { ToastType } from "react-native-toast-message";
import { Product, User } from "../../types/type";
import { ref, remove, set } from "firebase/database";
import { realTimeDb } from "../../firebaseConfig";

export const deleteProductDataRealtime = async (
  productId: String,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null,
  setToggleToast: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    const productRef = ref(
      realTimeDb,
      `users/${user?.uid}/products/${productId}`
    );

    await set(productRef, null);
    setToggleToast((prev) => prev + 1);
    showToast("success", "Product deleted successfully");
  } catch (error) {
    showToast("error", "Error Occured", "Try again later");
  }
};
