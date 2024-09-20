import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const getProductData = async (
  setProductList: (newProductList: Product[]) => void
) => {
  const user = auth.currentUser;
  if (user) {
    try {
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
    } catch (error) {}
  }
};
