import { useEffect } from "react";
import { Product, User } from "../../types/type";
import { realTimeDb } from "../../firebaseConfig";
import { onChildChanged, ref } from "firebase/database";

export const useProductOnChildChanged = (
  user: User | null,
  updateProduct: (productId: String, attribute: Partial<Product>) => void
) => {
  useEffect(() => {
    const productRef = ref(realTimeDb, `users/${user?.uid}/products/`);
    const handleOnChildChanged = () =>
      onChildChanged(productRef, (data) => {
        console.log("onChildChanged called");
        updateProduct(data.key!, {
          productName: data.val().productName,
          stockPrice: data.val().stockPrice,
          sellPrice: data.val().sellPrice,
          stock: data.val().stock,
          lowStockThreshold: data.val().lowStockThreshold,
        });
      });

    handleOnChildChanged();
  }, []);
};
