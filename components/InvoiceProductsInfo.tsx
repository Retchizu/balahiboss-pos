import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { CustomerReportParams } from "../types/type";
import { calculatePrice } from "../methods/calculation-methods/calculatePrice";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
type InvoiceInfoProp = {
  params: Readonly<
    CustomerReportParams & {
      fromSales: boolean;
    }
  >;
};
const InvoiceProductsInfo: React.FC<InvoiceInfoProp> = ({ params }) => {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.productsBoughtStyle}>Products Bought</Text>

      <View style={styles.rowFormat}>
        <Text style={[styles.invoiceLabel, { flex: 2 }]}>Description</Text>
        <Text style={[styles.invoiceLabel, { flex: 1, textAlign: "center" }]}>
          Qty
        </Text>
        <Text style={[styles.invoiceLabel, { flex: 1 }]}>Price</Text>
      </View>

      <FlatList
        data={params.selectedProducts}
        renderItem={({ item }) => (
          <View style={styles.rowFormat}>
            <Text style={[styles.invoiceValue, { flex: 2 }]}>
              {item.productName}
            </Text>
            <Text
              style={[styles.invoiceValue, { flex: 1, textAlign: "center" }]}
            >
              {item.quantity}
            </Text>
            <Text style={[styles.invoiceValue, { flex: 1 }]}>
              ₱ {calculatePrice(item).toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default InvoiceProductsInfo;

const styles = StyleSheet.create({
  productsBoughtStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(5),
    textAlign: "center",
  },
  invoiceLabel: {
    fontSize: wp(4.5),
    fontFamily: "SoraSemiBold",
  },
  invoiceValue: {
    fontSize: wp(3.5),
    fontFamily: "SoraMedium",
  },
  rowFormat: {
    flexDirection: "row",
    paddingTop: hp(1.5),
    alignItems: "center",
  },
});
