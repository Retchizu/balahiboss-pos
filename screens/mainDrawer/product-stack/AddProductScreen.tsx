import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import AddProductForm from "../../../components/AddProductForm";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { addProductData } from "../../../methods/data-methods/addProductData";
import { useProductContext } from "../../../context/ProductContext";
import { useToastContext } from "../../../context/ToastContext";

const AddProductScreen = () => {
  const [productInfo, setProductInfo] = useState({
    productName: "",
    sellPrice: "",
    stockPrice: "",
    lowStockThreshold: "2",
  });
  const { addProduct } = useProductContext();
  const { showToast } = useToastContext();

  const handleAddProductSubmit = () => {
    addProductData(productInfo, addProduct, showToast);
    setProductInfo({
      productName: "",
      sellPrice: "",
      stockPrice: "",
      lowStockThreshold: "2",
    });
  };
  return (
    <View style={styles.container}>
      <AddProductForm
        setProductInfo={setProductInfo}
        buttonLabel="Add Product"
        submit={handleAddProductSubmit}
        productInfo={productInfo}
      />
    </View>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F0E9",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp(5),
  },
});
