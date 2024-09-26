import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Product } from "../types/type";
import { calculateOverallCurrentStockTotalAmount } from "../methods/calculation-methods/calculateOverallCurrentStockTotalAmount";

type CurrentStockTotalViewProp = {
  products: Product[];
};

const CurrentStockTotalVIew = ({ products }: CurrentStockTotalViewProp) => {
  return (
    <View style={styles.currentStockTotalViewContainer}>
      <Text style={styles.valueStyle}>Overall Total:</Text>
      <Text style={styles.valueStyle}>
        ₱{calculateOverallCurrentStockTotalAmount(products).toFixed(2)}
      </Text>
    </View>
  );
};

export default CurrentStockTotalVIew;

const styles = StyleSheet.create({
  currentStockTotalViewContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    padding: wp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
});
