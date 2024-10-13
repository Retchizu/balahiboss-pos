import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { Product, User } from "../../types/type";
import { deleteDoc, doc } from "firebase/firestore";

export const deleteProductData = async (
  productId: String,
  setProductList: (newProductList: Product[]) => void,
  products: Product[],
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    const productRef = doc(
      db,
      "users",
      user?.uid!,
      "products",
      productId.toString()
    );
    await deleteDoc(productRef);
    const updatedData = products.filter((item) => item.id !== productId);
    setProductList(updatedData);
    showToast("success", "Product deleted successfully");
  } catch (error) {
    showToast("error", "Error Occured", "Try again later");
  }
};
