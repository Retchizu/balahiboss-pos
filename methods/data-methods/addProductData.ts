import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const addProductData = async (
  productInfo: {
    productName: string;
    sellPrice: string;
    stockPrice: string;
    lowStockThreshold: string;
  },
  addProduct: (newProduct: Product) => void
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
      console.log("Document written with ID: ", productRef.id);
    } else {
      //display message
      return;
    }
  } catch (error) {}
};
