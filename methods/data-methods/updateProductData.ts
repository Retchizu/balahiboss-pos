import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { Product, User } from "../../types/type";
import { doc, updateDoc } from "firebase/firestore";

export const updateProductData = async (
  productInfo: Product,
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    const productRef = doc(
      db,
      "users",
      user?.uid!,
      "products",
      productInfo.id.toString()
    );
    await updateDoc(productRef, {
      productName: productInfo.productName,
      stockPrice: productInfo.stockPrice,
      sellPrice: productInfo.sellPrice,
      stock: productInfo.stock,
      lowStockThreshold: productInfo.lowStockThreshold,
    });

    updateProduct(productInfo.id, {
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
