import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import { SelectedProduct } from "../types/type";
import { calculatePrice } from "../methods/calculation-methods/calculatePrice";
import { TextInput } from "react-native-gesture-handler";
import { quantityInputSetter } from "../methods/product-select-methods/quantityInputSetter";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type SelectedProductListProps = {
  data: SelectedProduct[];
  updateSelectedProduct: (
    productId: String,
    attribute: Partial<SelectedProduct>
  ) => void;
  setSeletectedProduct: (newSelectedProducts: SelectedProduct[]) => void;
  setQuantityInput: React.Dispatch<
    React.SetStateAction<{
      [productId: string]: string;
    }>
  >;
  quantityInput: {
    [productId: string]: string;
  };
};
const SelectedProductList = ({
  data,
  updateSelectedProduct,
  setSeletectedProduct,
  quantityInput,
  setQuantityInput,
}: SelectedProductListProps) => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.labelContainer}>
        <Text style={[styles.labelText, { flex: 2 }]}>Product name</Text>
        <Text style={[styles.labelText, { flex: 2, textAlign: "center" }]}>
          Price
        </Text>
        <Text style={[styles.labelText, { flex: 1, textAlign: "center" }]}>
          Qty
        </Text>
      </View>
      <FlatList
        removeClippedSubviews={false}
        data={data}
        renderItem={({ item }) => (
          <View style={styles.previewListContainer}>
            <Text
              style={[styles.itemText, { flex: 2 }]}
              onPress={() => {
                setSeletectedProduct(
                  data.filter(
                    (selectedProduct) => selectedProduct.id !== item.id
                  )
                );
                setQuantityInput((prevState) => {
                  const updatedState = { ...prevState };
                  delete updatedState[item.id];
                  return updatedState;
                });
              }}
            >
              {item.productName}
            </Text>
            <Text style={[styles.itemText, { flex: 2, textAlign: "center" }]}>
              ₱{calculatePrice(item).toFixed(2)}
            </Text>

            <TextInput
              keyboardType="decimal-pad"
              value={quantityInput[item.id]}
              onChangeText={(text) =>
                setQuantityInput((prev) => ({ ...prev, [item.id]: text }))
              }
              onSubmitEditing={(event) => {
                let text = event.nativeEvent.text;
                if (parseFloat(text) > item.stock) {
                  text = item.stock.toString();
                  setQuantityInput((prev) => ({
                    ...prev,
                    [item.id]: item.stock.toString(),
                  }));
                }
                if (parseFloat(text) < 0.1) {
                  text = "0.5";
                  setQuantityInput((prev) => ({
                    ...prev,
                    [item.id]: "0.5",
                  }));
                }
                updateSelectedProduct(item.id, {
                  quantity: parseFloat(text),
                });
              }}
              style={[
                styles.itemText,
                {
                  flex: 1,
                  textAlign: "center",
                  borderBottomWidth: wp(0.2),
                  borderColor: "#634F40",
                },
              ]}
            />
          </View>
        )}
      />
    </View>
  );
};

export default SelectedProductList;

const styles = StyleSheet.create({
  previewListContainer: {
    flexDirection: "row",
    alignItems: "center",
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
