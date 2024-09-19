import { CommonActions } from "@react-navigation/native";
import { Product, ProductStackParamList } from "../../types/type";
import { updateProductData } from "../data-methods/updateProductData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, db } from "../../firebaseConfig";

export const handleSameProductData = (
  products: Product[],
  id: string,
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  navigation: NativeStackNavigationProp<
    ProductStackParamList,
    "EditProductScreen",
    undefined
  >,
  productInfo: {
    productName: string;
    stockPrice: string;
    sellPrice: string;
    lowStockThreshold: string;
    buyStock: string;
    editStock: string;
  }
) => {
  const previousProductData = products.find(
    (previousProduct) => previousProduct.id === id
  );
  if (!previousProductData) {
    return;
  }
  const updatedProduct: Product = {
    id: id,
    productName: productInfo.productName,
    stockPrice: parseFloat(productInfo.stockPrice),
    sellPrice: parseFloat(productInfo.sellPrice),
    stock: parseFloat(productInfo.editStock),
    lowStockThreshold: parseFloat(productInfo.lowStockThreshold),
  };
  const isSameData =
    previousProductData.productName === updatedProduct.productName &&
    previousProductData.stockPrice === updatedProduct.stockPrice &&
    previousProductData.sellPrice === updatedProduct.sellPrice &&
    previousProductData.stock === updatedProduct.stock &&
    previousProductData.lowStockThreshold === updatedProduct.lowStockThreshold;
  if (!isSameData) {
    updateProductData(updatedProduct, updateProduct);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: "ProductListScreen" },
          { name: "ProductInfoScreen", params: updatedProduct },
        ],
      })
    );
    console.log("Product updated successfully");
  }
};

export const handleBuyStock = async (
  stockToBuy: number,
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  products: Product[],
  id: string,
  navigation: NativeStackNavigationProp<
    ProductStackParamList,
    "EditProductScreen",
    undefined
  >
) => {
  try {
    const getProductToUpdate = products.find((product) => product.id === id);
    if (getProductToUpdate) {
      const user = auth.currentUser;
      updateProduct(id, { stock: getProductToUpdate.stock + stockToBuy });
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("products")
        .doc(id)
        .update({
          stock: getProductToUpdate.stock + stockToBuy,
        });

      const updatedProduct: Product = {
        id: id,
        productName: getProductToUpdate.productName,
        stockPrice: getProductToUpdate.stockPrice,
        sellPrice: getProductToUpdate.sellPrice,
        stock: getProductToUpdate.stock + stockToBuy,
        lowStockThreshold: getProductToUpdate.lowStockThreshold,
      };
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "ProductListScreen" },
            { name: "ProductInfoScreen", params: updatedProduct },
          ],
        })
      );
    }
  } catch (error) {
    //display error
  }
};
