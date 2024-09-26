import { ToastType } from "react-native-toast-message";
import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const getProductData = async (
  setProductList: (newProductList: Product[]) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  const user = auth.currentUser;
  if (user) {
    try {
      setIsLoading(true);
      const fetched: Product[] = [];
      const productRef = db
        .collection("users")
        .doc(user.uid)
        .collection("products");
      const productData = await productRef.get();
      productData.forEach((doc) => {
        const { productName, stockPrice, sellPrice, stock, lowStockThreshold } =
          doc.data();
        fetched.push({
          id: doc.id,
          productName,
          stockPrice,
          sellPrice,
          stock,
          lowStockThreshold,
        });
      });

      setProductList(fetched);
      setIsLoading(false);
    } catch (error) {
      showToast(
        "error",
        "Something went wrong",
        "Can't get product data, try again later"
      );
    }
  }
};
