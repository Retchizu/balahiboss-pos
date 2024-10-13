import { ToastType } from "react-native-toast-message";
import {
  Product,
  ProductInfoType,
  ProductStackParamList,
} from "../../types/type";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export const handleBuyStockNavigation = (
  products: Product[],
  id: string,
  productInfo: ProductInfoType,
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfoType>>,
  navigation: NativeStackNavigationProp<
    ProductStackParamList,
    "EditProductScreen",
    undefined
  >,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  const getProductToUpdate = products.find((product) => product.id === id);
  if (productInfo.buyStock.trim() && getProductToUpdate) {
    const stockToBuy = parseFloat(
      productInfo.buyStock.trim() ? productInfo.buyStock : "0"
    );
    const updatedProduct: Product = {
      id: id,
      productName: getProductToUpdate.productName,
      stockPrice: getProductToUpdate.stockPrice,
      sellPrice: getProductToUpdate.sellPrice,
      stock: getProductToUpdate.stock + stockToBuy,
      lowStockThreshold: getProductToUpdate.lowStockThreshold,
    };
    setProductInfo((prev) => ({ ...prev, buyStock: "" }));
    if (isNaN(updatedProduct.stock)) {
      showToast("error", "Stock value required", "Can not buy stock");
      return;
    }
    navigation.pop();
    navigation.replace("ProductInfoScreen", updatedProduct);
  }
};
