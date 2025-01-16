import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import InputFormWithLabelHorizontal from "../../../components/InputFormWithLabelHorizontal";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@rneui/base";
import { ProductInfoType } from "../../../types/type";
import { useProductContext } from "../../../context/ProductContext";
import { handleInputChange } from "../../../methods/handleInputChange";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { handleBuyStock } from "../../../methods/product-manipulation-methods/handleBuyStock";
import { handleSameProductData } from "../../../methods/product-manipulation-methods/handleSameProductData";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useCurrentProductContext } from "../../../context/CurrentProductContext";

const EditProductScreen = () => {
  const { currentProduct, updateCurrentProduct } = useCurrentProductContext();
  const [productInfo, setProductInfo] = useState<ProductInfoType>({
    productName: currentProduct!.productName,
    stockPrice: currentProduct!.stockPrice.toString(),
    sellPrice: currentProduct!.sellPrice.toString(),
    lowStockThreshold: currentProduct!.lowStockThreshold
      ? currentProduct!.lowStockThreshold.toString()
      : "0",
    buyStock: "",
    editStock: currentProduct!.stock.toString(),
  });

  const { products } = useProductContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={styles.formContainer}
        >
          <Text style={styles.headerTitleStyle}>Configure Product</Text>

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
                  products,
                  currentProduct!.id,
                  showToast,
                  user
                );
                if (
                  productInfo.buyStock.trim() &&
                  !isNaN(parseFloat(productInfo.buyStock))
                ) {
                  updateCurrentProduct({
                    stock:
                      currentProduct!.stock + parseFloat(productInfo.buyStock),
                  });

                  handleInputChange(
                    "editStock",
                    (
                      currentProduct!.stock + parseFloat(productInfo.buyStock)
                    ).toString(),
                    setProductInfo
                  );
                  handleInputChange("buyStock", "0", setProductInfo);
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
          <Button
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.titleStyle}
            title="Confirm"
            onPress={() => {
              handleSameProductData(
                products,
                currentProduct!.id,
                updateCurrentProduct,
                productInfo,
                showToast,
                user
              );
            }}
          />
        </KeyboardAwareScrollView>
      </View>
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
