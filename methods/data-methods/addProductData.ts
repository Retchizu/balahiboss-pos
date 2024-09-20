import { ToastType } from "react-native-toast-message";
import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const addProductData = async (
  productInfo: {
    productName: string;
    sellPrice: string;
    stockPrice: string;
    lowStockThreshold: string;
  },
  addProduct: (newProduct: Product) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (
      productInfo.productName.trim() &&
      productInfo.sellPrice.trim() &&
      productInfo.lowStockThreshold.trim()
    ) {
      const user = auth.currentUser;
      const productRef = await db
        .collection("users")
        .doc(user?.uid)
        .collection("products")
        .add({
          productName: productInfo.productName,
          stockPrice: parseFloat(productInfo.stockPrice),
          sellPrice: parseFloat(productInfo.sellPrice),
          lowStockThreshold: parseFloat(productInfo.lowStockThreshold),
          stock: 0,
        });

      const newProduct: Product = {
        id: productRef.id,
        productName: productInfo.productName,
        stockPrice: parseFloat(productInfo.stockPrice),
        sellPrice: parseFloat(productInfo.sellPrice),
        lowStockThreshold: productInfo.lowStockThreshold.trim()
          ? parseFloat(productInfo.lowStockThreshold)
          : 2,
        stock: 0,
      };

      addProduct(newProduct);
      showToast(
        "success",
        "Product Added",
        `Successfully added product "${productInfo.productName}"`
      );
    } else {
      showToast("error", "Please Complete Missing Fields");
      return;
    }
  } catch (error) {
    showToast("error", "Error Occured", "Try again later");
  }
};
