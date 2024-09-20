import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { SalesReport, SalesReportStackParamList } from "../types/type";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { readableDate } from "../methods/time-methods/readableDate";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type SalesReportListProp = {
  data: SalesReport[];
  navigation: NativeStackNavigationProp<
    SalesReportStackParamList,
    "SalesReportScreen"
  >;
};

const SalesReportList = ({ data, navigation }: SalesReportListProp) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.customerInfoContainer}
            activeOpacity={0.5}
            onPress={() =>
              navigation.navigate("CustomerReportScreen", {
                id: item.id,
                cashPayment: item.invoiceForm.cashPayment,
                onlinePayment: item.invoiceForm.onlinePayment,
                customer: item.invoiceForm.customer,
                date: item.invoiceForm.date
                  ? item.invoiceForm.date.toISOString()
                  : null,
                deliveryFee: item.invoiceForm.deliveryFee,
                discount: item.invoiceForm.discount,
                freebies: item.invoiceForm.freebies,
                selectedProducts: item.selectedProduct,
                fromSales: true,
              })
            }
          >
            <Text style={styles.customerName}>
              {item.invoiceForm.customer?.customerName}
            </Text>
            <Text style={styles.timeStyle}>
              {readableDate(item.invoiceForm.date!)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SalesReportList;

const styles = StyleSheet.create({
  customerName: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  timeStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.5),
  },
  customerInfoContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(2),
    marginVertical: hp(0.5),
    borderRadius: wp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
