import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { ProductInfoScreenProp } from "../../../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InfoContainerHorizontal from "../../../components/InfoContainerHorizontal";
import Entypo from "@expo/vector-icons/Entypo";
import { Button } from "@rneui/base";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { useToastContext } from "../../../context/ToastContext";
import { useUserContext } from "../../../context/UserContext";
import { deleteProductDataRealtime } from "../../../methods/data-methods/deleteProductDataRealtiime";
import { useCurrentProductContext } from "../../../context/CurrentProductContext";

const ProductInfoScreen = ({ navigation }: ProductInfoScreenProp) => {
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);

  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const { currentProduct } = useCurrentProductContext();

  const handleDeleteProduct = () => {
    navigation.pop();
    navigation.replace("ProductListScreen");
    deleteProductDataRealtime(currentProduct!.id, showToast, user);
  };

  return (
    <View
      style={[
        styles.container,
        { opacity: isConfirmationModalVisible ? 0.1 : 1 },
      ]}
    >
      <InfoContainerHorizontal
        label={"Product name"}
        value={currentProduct!.productName}
      />
      <InfoContainerHorizontal
        label={"Stock price"}
        value={`₱ ${currentProduct!.stockPrice.toFixed(2)}`}
      />
      <InfoContainerHorizontal
        label={"Sell price"}
        value={`₱ ${currentProduct!.sellPrice.toFixed(2)}`}
      />
      <InfoContainerHorizontal
        label={"Stock"}
        value={currentProduct!.stock.toString()}
      />
      <InfoContainerHorizontal
        label={"Low stock threshold"}
        value={currentProduct!.lowStockThreshold.toString()}
      />

      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        setIsVisible={setIsConfirmationModalVisible}
        cancelFn={() => setIsConfirmationModalVisible(false)}
        confirmFn={() => handleDeleteProduct()}
        confirmationTitle={`Delete product "${currentProduct!.productName}"`}
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
          onPress={() => navigation.navigate("EditProductScreen")}
        />
      </View>
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
