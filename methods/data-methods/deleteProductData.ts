import { auth, db } from "../../firebaseConfig";
import { Product } from "../../types/type";

export const deleteProductData = async (
  productId: String,
  setProductList: (newProductList: Product[]) => void,
  products: Product[]
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
    console.log("Product deleted successfully");
  } catch (error) {}
};
