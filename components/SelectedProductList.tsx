import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import { SelectedProduct } from "../types/type";
import { calculatePrice } from "../methods/calculation-methods/calculatePrice";
import Entypo from "@expo/vector-icons/Entypo";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";

type SelectedProductListProps = {
  data: SelectedProduct[];
  updateSelectedProduct: (
    productId: String,
    attribute: Partial<SelectedProduct>
  ) => void;
  setSeletectedProduct: (newSelectedProducts: SelectedProduct[]) => void;
};
const SelectedProductList = ({
  data,
  updateSelectedProduct,
  setSeletectedProduct,
}: SelectedProductListProps) => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.labelContainer}>
        <Text style={[styles.labelText, { flex: 2.5 }]}>Product name</Text>
        <Text style={[styles.labelText, { flex: 1.7 }]}>Price</Text>
        <Text style={[styles.labelText, { flex: 1 }]}>Qty</Text>
      </View>
      <FlatList
        removeClippedSubviews={false}
        data={data}
        renderItem={({ item }) => (
          <View style={styles.previewListContainer}>
            <Text
              style={[styles.itemText, { flex: 2.5 }]}
              onPress={() => {
                setSeletectedProduct(
                  data.filter(
                    (selectedProduct) => selectedProduct.id !== item.id
                  )
                );
              }}
            >
              {item.productName}
            </Text>
            <Text style={[styles.itemText, { flex: 2, textAlign: "center" }]}>
              ₱{calculatePrice(item).toFixed(2)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Button
                buttonStyle={styles.buttonStyleMinus}
                icon={<Entypo name="minus" size={wp(3.5)} color="#F3F0E9" />}
                onPress={() =>
                  updateSelectedProduct(item.id, {
                    quantity: Math.max(item.quantity - 0.5, 0.5),
                  })
                }
              />

              <Text
                style={[
                  styles.itemText,
                  {
                    width: wp(11),
                    paddingHorizontal: wp(1),
                    textAlign: "center",
                  },
                ]}
              >
                {item.quantity}
              </Text>
              <Button
                buttonStyle={styles.buttonStyleAdd}
                icon={<Entypo name="plus" size={wp(3.5)} color="#F3F0E9" />}
                onPress={() =>
                  updateSelectedProduct(item.id, {
                    quantity: Math.min(item.quantity + 0.5, item.stock),
                  })
                }
              />
            </View>
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
    borderBottomWidth: wp(0.2),
    paddingVertical: hp(1),
    borderColor: "#634F40",
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
  buttonStyleAdd: {
    backgroundColor: "#50C878",
  },
  buttonStyleMinus: {
    backgroundColor: "#ff6347",
  },
});
