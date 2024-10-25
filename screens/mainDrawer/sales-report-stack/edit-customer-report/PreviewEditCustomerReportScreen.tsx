import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import SelectedProductList from "../../../../components/SelectedProductList";
import { useSelectedProductInEditContext } from "../../../../context/SelectedProductInEditContext";
import { calculateTotalPrice } from "../../../../methods/calculation-methods/calculateTotalPrice";
import { deleteSelectedProduct } from "../../../../methods/product-select-methods/deleteSelectedProduct";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const PreviewEditCustomerReportScreen = () => {
  const {
    selectedProductsInEdit,
    updateSelectedProductInEdit,
    setSelectedProductListInEdit,
  } = useSelectedProductInEditContext();

  return (
    <View style={[styles.container]}>
      <SelectedProductList
        data={selectedProductsInEdit}
        updateSelectedProduct={updateSelectedProductInEdit}
        setSeletectedProduct={setSelectedProductListInEdit}
      />
      <View style={styles.footerStyle}>
        <Text style={styles.totalStyle}>
          Total Price: ₱{calculateTotalPrice(selectedProductsInEdit).toFixed(2)}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => deleteSelectedProduct(setSelectedProductListInEdit)}
        >
          <Entypo name="trash" size={26} color="#634F40" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviewEditCustomerReportScreen;

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
