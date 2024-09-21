import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import InputFormWithLabelHorizontal from "../../../components/InputFormWithLabelHorizontal";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, StringOmit } from "@rneui/base";
import { EditProductInfoScreenProp, Product } from "../../../types/type";
import { updateProductData } from "../../../methods/data-methods/updateProductData";
import { useProductContext } from "../../../context/ProductContext";
import { handleInputChange } from "../../../methods/handleInputChange";
import { CommonActions } from "@react-navigation/native";
import {
  handleBuyStock,
  handleSameProductData,
} from "../../../methods/product-manipulation-methods/editProductMethod";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";

const EditProductScreen = ({
  route,
  navigation,
}: EditProductInfoScreenProp) => {
  const params = route.params;
  const [productInfo, setProductInfo] = useState({
    productName: params.productName,
    stockPrice: params.stockPrice.toString(),
    sellPrice: params.sellPrice.toString(),
    lowStockThreshold: params.lowStockThreshold
      ? params.lowStockThreshold.toString()
      : "2",
    buyStock: "",
    editStock: params.stock.toString(),
  });
  const { updateProduct, products } = useProductContext();
  const { showToast } = useToastContext();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.headerTitleStyle}>Configure Product</Text>
        <ScrollView>
          <InputFormWithLabelHorizontal
            formLabel="Product name"
            maxLength={35}
            value={productInfo.productName}
            onChangeText={(text) =>
              handleInputChange("productName", text, setProductInfo)
            }
          />
          <InputFormWithLabelHorizontal
            formLabel="Stock price"
            keyboardType="numeric"
            maxLength={9}
            contextMenuHidden={true}
            value={productInfo.stockPrice}
            onChangeText={(text) =>
              handleInputChange("stockPrice", text, setProductInfo)
            }
          />
          <InputFormWithLabelHorizontal
            formLabel="Sell price"
            keyboardType="numeric"
            maxLength={9}
            contextMenuHidden={true}
            value={productInfo.sellPrice}
            onChangeText={(text) =>
              handleInputChange("sellPrice", text, setProductInfo)
            }
          />
          <InputFormWithLabelHorizontal
            formLabel="Low stock alert threshold"
            keyboardType="numeric"
            maxLength={9}
            contextMenuHidden={true}
            value={productInfo.lowStockThreshold}
            onChangeText={(text) =>
              handleInputChange("lowStockThreshold", text, setProductInfo)
            }
          />
          <View style={styles.buyStockRow}>
            <InputFormWithLabelHorizontal
              formLabel="Add stock"
              keyboardType="numeric"
              maxLength={9}
              contextMenuHidden={true}
              value={productInfo.buyStock}
              onChangeText={(text) =>
                handleInputChange("buyStock", text, setProductInfo)
              }
            />

            <Button
              containerStyle={{ alignSelf: "flex-end", top: wp(1.5) }}
              buttonStyle={[
                styles.buttonStyle,
                { marginVertical: wp(1), width: wp(20) },
              ]}
              titleStyle={[styles.titleStyle, { fontSize: wp(3.5) }]}
              title={"Add"}
              onPress={() => {
                handleBuyStock(
                  parseFloat(productInfo.buyStock),
                  updateProduct,
                  products,
                  params.id,
                  navigation,
                  showToast
                );
                if (productInfo.buyStock.trim()) {
                  setProductInfo((prev) => ({ ...prev, buyStock: "" }));
                }
                if (!productInfo.buyStock.trim()) {
                  showToast(
                    "error",
                    "Stock value required",
                    "Can not buy stock"
                  );
                }
              }}
            />
          </View>

          <InputFormWithLabelHorizontal
            formLabel="Edit stock"
            keyboardType="numeric"
            maxLength={9}
            contextMenuHidden={true}
            value={productInfo.editStock}
            onChangeText={(text) =>
              handleInputChange("editStock", text, setProductInfo)
            }
          />
        </ScrollView>
        <Button
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          title="Confirm"
          onPress={() => {
            handleSameProductData(
              products,
              params.id,
              updateProduct,
              navigation,
              productInfo,
              showToast
            );
          }}
        />
      </View>
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </SafeAreaView>
  );
};

export default EditProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp(10),
    backgroundColor: "#F3F0E9",
  },
  formContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(10),
    borderRadius: wp(1.5),
  },
  headerTitleStyle: {
    fontFamily: "SoraBold",
    fontSize: wp(5),
    textAlign: "center",
    paddingVertical: hp(2),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    marginVertical: hp(1),
    borderRadius: wp(1.5),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  buyStockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
