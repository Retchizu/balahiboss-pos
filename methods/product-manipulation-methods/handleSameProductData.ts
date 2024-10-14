import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Product, ProductStackParamList, User } from "../../types/type";
import { ToastType } from "react-native-toast-message";
import { updateProductData } from "../data-methods/updateProductData";

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
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
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
    stockPrice: parseFloat(
      productInfo.stockPrice.trim() ? productInfo.stockPrice : "0"
    ),
    sellPrice: parseFloat(
      productInfo.sellPrice.trim() ? productInfo.sellPrice : "0"
    ),
    stock: parseFloat(
      productInfo.editStock.trim() ? productInfo.editStock : "0"
    ),
    lowStockThreshold: parseFloat(
      productInfo.lowStockThreshold.trim() ? productInfo.lowStockThreshold : "0"
    ),
  };
  const isSameData =
    previousProductData.productName === updatedProduct.productName &&
    previousProductData.stockPrice === updatedProduct.stockPrice &&
    previousProductData.sellPrice === updatedProduct.sellPrice &&
    previousProductData.stock === updatedProduct.stock &&
    previousProductData.lowStockThreshold === updatedProduct.lowStockThreshold;
  if (!isSameData) {
    updateProductData(updatedProduct, updateProduct, showToast, user);
    navigation.pop();
    navigation.replace("ProductInfoScreen", updatedProduct);
  } else {
    navigation.pop();
    navigation.replace("ProductInfoScreen", updatedProduct);
  }
};