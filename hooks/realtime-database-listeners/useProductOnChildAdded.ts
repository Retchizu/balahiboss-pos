import { onChildAdded, ref } from "firebase/database";
import { useCallback, useEffect } from "react";
import { realTimeDb } from "../../firebaseConfig";
import { Product, User } from "../../types/type";

export const useProductOnChildAdded = (
  user: User | null,
  products: Product[],
  addProduct: (newProduct: Product) => void
) => {
  const handleOnChildAdded = useCallback(() => {
    const productRef = ref(realTimeDb, `users/${user?.uid}/products`);
    onChildAdded(productRef, (data) => {
      console.log("onChildeAdded called");
      const { productName, stockPrice, sellPrice, stock, lowStockThreshold } =
        data.val();
      const product: Product = {
        id: data.key!,
        productName,
        stockPrice,
        sellPrice,
        stock,
        lowStockThreshold,
      };
      const doesProductExist = products.find(
        (originProduct) => originProduct.id === product.id
      );
      if (!doesProductExist) {
        addProduct(product);
      }
    });
  }, [addProduct]);

  useEffect(() => {
    handleOnChildAdded();
  }, []);
};
