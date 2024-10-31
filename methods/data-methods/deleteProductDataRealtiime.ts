import { ToastType } from "react-native-toast-message";
import { User } from "../../types/type";
import { ref, set } from "firebase/database";
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
    showToast("success", "Product deleted successfully");
    setToggleToast((prev) => prev + 1);
  } catch (error) {
    showToast("error", "Error Occured", "Try again later");
  }
};
