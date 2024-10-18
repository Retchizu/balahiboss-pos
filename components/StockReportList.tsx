import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { memo, useCallback } from "react";
import { Product, SalesReport, SelectedProduct } from "../types/type";
import { calculateTotalStockSold } from "../methods/calculation-methods/calculateTotalStockSold";
import { calculateTotalStockAmount } from "../methods/calculation-methods/calculateTotalStockAmount";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type StockReportListProp = {
  data: Product[];
  salesReport: SalesReport[];
};

const StockReportList = ({ data, salesReport }: StockReportListProp) => {
  const renderStockReportList = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.rowFormat}>
        <Text style={[styles.valueStyle, { flex: 2, maxWidth: wp(30) }]}>
          {item.productName}
        </Text>
        <Text
          style={[
            styles.valueStyle,
            { color: "blue", flex: 1, textAlign: "center" },
          ]}
        >
          {item.stock}
        </Text>
        <Text style={[styles.valueStyle, { flex: 1, textAlign: "center" }]}>
          {calculateTotalStockSold(salesReport, item.id).toString()}
        </Text>
        <Text
          style={
            (styles.valueStyle,
            { flex: 1.5, textAlign: "right", fontFamily: "SoraSemiBold" })
          }
        >
          ₱ {calculateTotalStockAmount(item).toFixed(2)}
        </Text>
      </View>
    ),
    [salesReport, data]
  );
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: wp(1),
          marginBottom: hp(1),
          borderColor: "#634F40",
        }}
      >
        <Text style={[styles.labelStyle, { flex: 1.7 }]}></Text>
        <Text
          style={[
            styles.labelStyle,
            { flex: 1, textAlignVertical: "bottom", textAlign: "center" },
          ]}
        >
          Current Stock
        </Text>
        <Text
          style={[
            styles.labelStyle,
            { flex: 1, textAlignVertical: "bottom", textAlign: "center" },
          ]}
        >
          Total Stock Sold
        </Text>
        <Text
          style={[
            styles.labelStyle,
            { flex: 1.5, textAlign: "right", textAlignVertical: "bottom" },
          ]}
        >
          CSTA
        </Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderStockReportList}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default memo(StockReportList);

const styles = StyleSheet.create({
  rowFormat: {
    flexDirection: "row",
    borderBottomWidth: wp(0.3),
    alignItems: "center",
  },
  valueStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.2),
  },
  labelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3.2),
  },
});
