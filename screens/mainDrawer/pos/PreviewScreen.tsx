import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect } from "react";
import SelectedProductList from "../../../components/SelectedProductList";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { clearSelectedProduct } from "../../../methods/product-select-methods/clearSelectedProduct";
import Entypo from "@expo/vector-icons/Entypo";
import { calculateTotalPrice } from "../../../methods/calculation-methods/calculateTotalPrice";
import { useProductContext } from "../../../context/ProductContext";
import { useToastContext } from "../../../context/ToastContext";

const PreviewScreen = () => {
  const {
    selectedProducts,
    deleteSelectedProduct,
    updateSelectedProduct,
    setSelectedProductList,
  } = useSelectedProductContext();
  const { products } = useProductContext();
  const { showToast } = useToastContext();

  useEffect(() => {
    //TODO: fix toast
    const productStockConflict = Array.from(selectedProducts.values()).filter(
      (selectedProduct) => {
        const findProduct = products.find(
          (product) => product.id === selectedProduct.id
        );
        return findProduct?.stock === 0;
      }
    );
    if (productStockConflict.length) {
      clearSelectedProduct(setSelectedProductList);
      showToast(
        "info",
        "Products out of stock",
        productStockConflict
          .map((productConflicted) => productConflicted.productName)
          .join(", ")
      );
    }
  }, [products]);
  return (
    <View style={[styles.container]}>
      <SelectedProductList
        data={selectedProducts}
        updateSelectedProduct={updateSelectedProduct}
        deleteSelectedProduct={deleteSelectedProduct}
      />
      <View style={styles.footerStyle}>
        <Text style={styles.totalStyle}>
          Total Price: ₱{calculateTotalPrice(selectedProducts).toFixed(2)}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            clearSelectedProduct(setSelectedProductList);
          }}
        >
          <Entypo name="trash" size={26} color="#634F40" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingBottom: hp(1),
  },
  totalStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(4),
  },
  footerStyle: {
    flexDirection: "row",
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    padding: wp(2),
    justifyContent: "space-between",
    alignItems: "center",
  },
});
