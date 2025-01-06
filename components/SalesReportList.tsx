import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback } from "react";
import {
  CustomerReportParams,
  SalesReport,
  SalesReportStackParamList,
} from "../types/type";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { readableDate } from "../methods/time-methods/readableDate";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { noPaymentColor } from "../methods/noPaymentColor";
import { readableTime } from "../methods/time-methods/readableTime";
import Entypo from "@expo/vector-icons/Entypo";

type SalesReportListProp = {
  data: SalesReport[];
  navigation: NativeStackNavigationProp<
    SalesReportStackParamList,
    "SalesReportScreen"
  >;
  setCurrentSalesReport: React.Dispatch<
    React.SetStateAction<
      | (CustomerReportParams & {
          fromSales: boolean;
        })
      | null
    >
  >;
};

const SalesReportList = ({
  data,
  navigation,
  setCurrentSalesReport,
}: SalesReportListProp) => {
  const renderSalesReportList = useCallback(
    ({ item }: { item: SalesReport }) => (
      <TouchableOpacity
        style={[
          styles.customerInfoContainer,
          {
            borderColor: noPaymentColor(
              item.invoiceForm.cashPayment,
              item.invoiceForm.onlinePayment
            ),
          },
        ]}
        activeOpacity={0.5}
        onPress={() => {
          const convertSalesReportToCustomerParams = {
            id: item.id,
            cashPayment: item.invoiceForm.cashPayment,
            onlinePayment: item.invoiceForm.onlinePayment,
            customer: item.invoiceForm.customer,
            date: item.invoiceForm.date
              ? item.invoiceForm.date.toISOString()
              : null,
            discount: item.invoiceForm.discount,
            freebies: item.invoiceForm.freebies,
            deliveryFee: item.invoiceForm.deliveryFee,
            selectedProducts: item.selectedProduct,
            fromSales: true,
          };
          setCurrentSalesReport(convertSalesReportToCustomerParams);
          navigation.navigate("CustomerReportScreen");
        }}
      >
        <Text
          style={[
            styles.customerName,
            {
              color: noPaymentColor(
                item.invoiceForm.cashPayment,
                item.invoiceForm.onlinePayment
              ),
            },
          ]}
        >
          {item.invoiceForm.customer?.customerName}
        </Text>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Entypo
              name="calendar"
              size={wp(3.5)}
              color={noPaymentColor(
                item.invoiceForm.cashPayment,
                item.invoiceForm.onlinePayment
              )}
              style={styles.iconStyle}
            />
            <Text
              style={[
                styles.timeStyle,
                {
                  color: noPaymentColor(
                    item.invoiceForm.cashPayment,
                    item.invoiceForm.onlinePayment
                  ),
                },
              ]}
            >
              {readableDate(item.invoiceForm.date!)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Entypo
              name="clock"
              size={wp(3)}
              color={noPaymentColor(
                item.invoiceForm.cashPayment,
                item.invoiceForm.onlinePayment
              )}
              style={styles.iconStyle}
            />
            <Text
              style={[
                styles.timeStyle,
                {
                  color: noPaymentColor(
                    item.invoiceForm.cashPayment,
                    item.invoiceForm.onlinePayment
                  ),
                  fontSize: wp(3),
                },
              ]}
            >
              {readableTime(item.invoiceForm.date!)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [data]
  );
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        renderItem={renderSalesReportList}
        windowSize={5}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
      />
    </View>
  );
};

export default SalesReportList;

const styles = StyleSheet.create({
  customerName: {
    flex: 1,
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
  iconStyle: { alignSelf: "center", paddingRight: wp(1) },
});
