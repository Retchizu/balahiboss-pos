import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { ProductInfoScreenProp } from "../../../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InfoContainerHorizontal from "../../../components/InfoContainerHorizontal";
import Entypo from "@expo/vector-icons/Entypo";
import { Button } from "@rneui/base";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { deleteProductData } from "../../../methods/data-methods/deleteProductData";
import { useProductContext } from "../../../context/ProductContext";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";

const ProductInfoScreen = ({ route, navigation }: ProductInfoScreenProp) => {
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const { setProductList, products } = useProductContext();
  const params = route.params;

  const { showToast } = useToastContext();

  return (
    <View
      style={[
        styles.container,
        { opacity: isConfirmationModalVisible ? 0.1 : 1 },
      ]}
    >
      <InfoContainerHorizontal
        label={"Product name"}
        value={params.productName}
      />
      <InfoContainerHorizontal
        label={"Stock price"}
        value={`₱ ${params.stockPrice.toFixed(2)}`}
      />
      <InfoContainerHorizontal
        label={"Sell price"}
        value={`₱ ${params.sellPrice.toFixed(2)}`}
      />
      <InfoContainerHorizontal
        label={"Stock"}
        value={params.stock.toString()}
      />
      <InfoContainerHorizontal
        label={"Low stock threshold"}
        value={
          params.lowStockThreshold ? params.lowStockThreshold.toString() : "2"
        }
      />

      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        setIsVisible={setIsConfirmationModalVisible}
        cancelFn={() => setIsConfirmationModalVisible(false)}
        confirmFn={() => {
          deleteProductData(params.id, setProductList, products, showToast);
          navigation.goBack();
        }}
        confirmationTitle={`Delete product "${params.productName}"`}
        confirmationDescription="Do you want to delete this product?"
      />
      <View style={styles.buttonContainer}>
        <Button
          icon={<Entypo name="trash" size={24} color="#F3F0E9" />}
          buttonStyle={styles.buttonStyle}
          onPress={() => setIsConfirmationModalVisible(true)}
        />
        <Button
          icon={<Entypo name="edit" size={24} color="#F3F0E9" />}
          buttonStyle={styles.buttonStyle}
          onPress={() => navigation.navigate("EditProductScreen", params)}
        />
      </View>
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default ProductInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(2),
    backgroundColor: "#F3F0E9",
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    marginHorizontal: wp(2),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: hp(2),
  },
});
