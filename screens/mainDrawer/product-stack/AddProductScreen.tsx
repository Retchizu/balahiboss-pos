import { StyleSheet, View } from "react-native";
import { useState } from "react";
import AddProductForm from "../../../components/AddProductForm";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useToastContext } from "../../../context/ToastContext";
import { useUserContext } from "../../../context/UserContext";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { addProductDataRealtime } from "../../../methods/data-methods/addProductDataRealtime";
import Toast from "react-native-toast-message";

const AddProductScreen = () => {
  const [productInfo, setProductInfo] = useState({
    productName: "",
    sellPrice: "",
    stockPrice: "",
    lowStockThreshold: "2",
  });
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  const handleAddProductSubmit = async () => {
    await addProductDataRealtime(productInfo, showToast, user);
    setProductInfo({
      productName: "",
      sellPrice: "",
      stockPrice: "",
      lowStockThreshold: "2",
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="position">
        <AddProductForm
          setProductInfo={setProductInfo}
          buttonLabel="Add Product"
          submit={handleAddProductSubmit}
          productInfo={productInfo}
        />
      </KeyboardAvoidingView>
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
