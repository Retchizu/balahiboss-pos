import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Product, SelectedProduct } from "../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { selectProduct } from "../methods/product-select-methods/selectProduct";
import { useToastContext } from "../context/ToastContext";
import Toast from "react-native-toast-message";

type ProductPOSListProps = {
  data: Product[];
  addSelectedProduct: (newProduct: SelectedProduct) => void;
  selectedProducts: SelectedProduct[];
  setSelectedProductList: (newProductList: SelectedProduct[]) => void;
};
const ProductPOSList: React.FC<ProductPOSListProps> = ({
  data,
  addSelectedProduct,
  selectedProducts,
  setSelectedProductList,
}) => {
  const { showToast } = useToastContext();
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.labelContainer}>
        <Text style={[styles.labelText, { flex: 3 }]}>Product name</Text>
        <Text style={[styles.labelText, { flex: 1, textAlign: "center" }]}>
          Price
        </Text>
        <Text style={[styles.labelText, { flex: 1, textAlign: "center" }]}>
          Stock
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.productContainer,
              {
                backgroundColor:
                  item.stock !== 0
                    ? selectedProducts.some(
                        (selectedProduct) => selectedProduct.id === item.id
                      )
                      ? "#94e6b7"
                      : "#F3F0E9"
                    : "#D3D3D3",
              },
            ]}
            activeOpacity={0.5}
            onPress={
              item.stock !== 0
                ? () =>
                    selectProduct(
                      item,
                      addSelectedProduct,
                      selectedProducts,
                      setSelectedProductList
                    )
                : () => {
                    console.log(`${item.productName} is out of stock`);
                    showToast(
                      "info",
                      "Out of Stock",
                      `${item.productName} is out of stock`
                    );
                  }
            }
          >
            <Text style={[styles.itemText, { flex: 3 }]}>
              {item.productName}
            </Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: "center" }]}>
              ₱{item.sellPrice}
            </Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: "center" }]}>
              {item.stock.toString()}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default ProductPOSList;

const styles = StyleSheet.create({
  productContainer: {
    flexDirection: "row",
    borderWidth: wp(0.3),
    borderRadius: wp(2),
    borderColor: "#634F40",
    marginVertical: hp(0.4),
    padding: wp(1),
  },
  labelContainer: {
    flexDirection: "row",
  },
  labelText: {
    fontSize: wp(4.5),
    fontFamily: "SoraBold",
  },
  itemText: {
    fontSize: wp(4),
    fontFamily: "SoraSemiBold",
  },
});
