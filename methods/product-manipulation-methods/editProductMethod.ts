import { CommonActions } from "@react-navigation/native";
import { Product, ProductStackParamList } from "../../types/type";
import { updateProductData } from "../data-methods/updateProductData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, db } from "../../firebaseConfig";
import { ToastType } from "react-native-toast-message";

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
  },
  showToast: (type: ToastType, text1: string, text2?: string) => void
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
    updateProductData(updatedProduct, updateProduct, showToast);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: "ProductListScreen" },
          { name: "ProductInfoScreen", params: updatedProduct },
        ],
      })
    );
  } else {
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
  >,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (isNaN(stockToBuy)) {
      showToast("error", "Stock value required", "Can not buy stock");
      return;
    }
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
      showToast("success", "Stocks added successfully");
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
    showToast("error", "Error occured", "Try again later");
  }
};
