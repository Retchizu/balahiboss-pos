import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { Product, User } from "../../types/type";
import { collection, getDocs } from "firebase/firestore";

export const getProductData = async (
  setProductList: (newProductList: Product[]) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  if (user) {
    try {
      setIsLoading(true);
      const fetched: Product[] = [];
      const productData = await getDocs(
        collection(db, "users", user.uid, "products")
      );
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

      console.log((error as Error).message);
    }
  }
};
