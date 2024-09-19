import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const updateProductData = async (
  productInfo: Product,
  updateProduct: (productId: String, attribute: Partial<Product>) => void
) => {
  try {
    const user = auth.currentUser;
    const productRef = db
      .collection("users")
      .doc(user?.uid)
      .collection("products")
      .doc(productInfo.id.toString());
    await productRef.update({
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

    console.log("Product updated successfully");
  } catch (error) {}
};
