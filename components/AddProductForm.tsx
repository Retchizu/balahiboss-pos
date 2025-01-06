import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InputFormWithLabelHorizontal from "./InputFormWithLabelHorizontal";
import { handleInputChange } from "../methods/handleInputChange";
import { Button } from "@rneui/base";
import { useToastContext } from "../context/ToastContext";

type AddProductFormProps = {
  productInfo: {
    productName: string;
    sellPrice: string;
    stockPrice: string;
    lowStockThreshold: string;
  };
  setProductInfo: React.Dispatch<
    React.SetStateAction<{
      productName: string;
      sellPrice: string;
      stockPrice: string;
      lowStockThreshold: string;
    }>
  >;
  buttonLabel: string;
  submit: () => Promise<void>;
};

const AddProductForm = ({
  setProductInfo,
  buttonLabel,
  submit,
  productInfo,
}: AddProductFormProps) => {
  const { showToast } = useToastContext();
  return (
    <View style={styles.container}>
      <Text style={styles.AddProductFormTitle}>Add a product</Text>
      <InputFormWithLabelHorizontal
        formLabel="Product name"
        onChangeText={(text) =>
          handleInputChange("productName", text, setProductInfo)
        }
        maxLength={35}
        value={productInfo.productName}
      />
      <InputFormWithLabelHorizontal
        formLabel="Stock price"
        onChangeText={(text) =>
          handleInputChange("stockPrice", text, setProductInfo)
        }
        keyboardType="numeric"
        maxLength={9}
        contextMenuHidden={true}
        value={productInfo.stockPrice}
      />
      <InputFormWithLabelHorizontal
        formLabel="Sell price"
        onChangeText={(text) =>
          handleInputChange("sellPrice", text, setProductInfo)
        }
        keyboardType="numeric"
        maxLength={9}
        contextMenuHidden={true}
        value={productInfo.sellPrice}
      />
      <InputFormWithLabelHorizontal
        formLabel="Low stock alert threshold"
        onChangeText={(text) =>
          handleInputChange("lowStockThreshold", text, setProductInfo)
        }
        keyboardType="numeric"
        maxLength={9}
        contextMenuHidden={true}
        value={productInfo.lowStockThreshold}
      />
      <Button
        title={buttonLabel}
        buttonStyle={styles.buttonStyle}
        titleStyle={styles.titleStyle}
        onPress={() => {
          if (
            productInfo.productName &&
            productInfo.sellPrice &&
            productInfo.sellPrice
          ) {
            submit();
          } else {
            showToast(
              "error",
              "Incomplete Fields",
              "Please complete the missing fields"
            );
          }
        }}
      />
    </View>
  );
};

export default AddProductForm;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F0E9",
    borderWidth: wp(0.3),
    padding: wp(10),
    borderRadius: wp(1.5),
  },
  formParentContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(10),
  },
  AddProductFormTitle: {
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
});
