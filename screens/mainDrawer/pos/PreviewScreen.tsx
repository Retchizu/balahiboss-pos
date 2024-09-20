import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import SelectedProductList from "../../../components/SelectedProductList";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { deleteSelectedProduct } from "../../../methods/product-select-methods/deleteSelectedProduct";
import Entypo from "@expo/vector-icons/Entypo";
import { calculateTotalPrice } from "../../../methods/calculation-methods/calculateTotalPrice";

const PreviewScreen = () => {
  const { selectedProducts, setSelectedProductList, updateSelectedProduct } =
    useSelectedProductContext();
  const [quantityInput, setQuantityInput] = useState<{
    [productId: string]: string;
  }>({});

  useEffect(() => {
    let initialQuantityInput: {
      [productId: string]: string;
    } = { ...quantityInput };
    selectedProducts.forEach((item) => {
      if (!quantityInput[item.id]) initialQuantityInput[item.id] = "1";
    });
    setQuantityInput(initialQuantityInput);
  }, [selectedProducts]);

  return (
    <View style={[styles.container]}>
      <SelectedProductList
        data={selectedProducts}
        updateSelectedProduct={updateSelectedProduct}
        setSeletectedProduct={setSelectedProductList}
        quantityInput={quantityInput}
        setQuantityInput={setQuantityInput}
      />
      <View style={styles.footerStyle}>
        <Text style={styles.totalStyle}>
          Total Price: ₱{calculateTotalPrice(selectedProducts).toFixed(2)}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            deleteSelectedProduct(setSelectedProductList);
            setQuantityInput({});
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
