import { ToastType } from "react-native-toast-message";
import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const deleteProductData = async (
  productId: String,
  setProductList: (newProductList: Product[]) => void,
  products: Product[],
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    const user = auth.currentUser;
    await db
      .collection("users")
      .doc(user?.uid)
      .collection("products")
      .doc(productId.toString())
      .delete();

    const updatedData = products.filter((item) => item.id !== productId);
    setProductList(updatedData);
    showToast("success", "Product deleted successfully");
  } catch (error) {
    showToast("error", "Error Occured", "Try again later");
  }
};
