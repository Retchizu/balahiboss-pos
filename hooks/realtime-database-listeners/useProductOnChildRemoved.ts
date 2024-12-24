import { onChildRemoved, ref } from "firebase/database";
import { useCallback, useEffect } from "react";
import { realTimeDb } from "../../firebaseConfig";
import { Product, User } from "../../types/type";

export const useProductOnChildRemoved = (
  user: User | null,
  products: Product[],
  setProductList: (newProductList: Product[]) => void
) => {
  const handleOnChildRemoved = useCallback(() => {
    const productRef = ref(realTimeDb, `users/${user?.uid}/products`);
    onChildRemoved(productRef, (data) => {
      // console.log("onChildRemoved called");
      const productToDelete = products.find(
        (product) => product.id === data.key!
      );
      if (productToDelete) {
        const filterProductList = products.filter(
          (product) => product.id !== productToDelete.id
        );
        setProductList(filterProductList);
      }
    });
  }, [products]);

  useEffect(() => {
    handleOnChildRemoved();
  }, [handleOnChildRemoved]);
};
