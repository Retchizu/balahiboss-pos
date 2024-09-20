import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { CustomerReportScreenProp } from "../../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InfoHorizontal from "../../components/InfoHorizontal";
import { readableDate } from "../../methods/time-methods/readableDate";
import { calculateTotalPrice } from "../../methods/calculation-methods/calculateTotalPrice";
import { calculateTotalProfit } from "../../methods/calculation-methods/calculateTotalProfit";
import { calculatePrice } from "../../methods/calculation-methods/calculatePrice";
import { Button } from "@rneui/base";
import Entypo from "@expo/vector-icons/Entypo";
import ConfirmationModal from "../../components/ConfirmationModal";
import { deleteSalesReportData } from "../../methods/data-methods/deleteSalesReportData";
import { useSalesReportContext } from "../../context/SalesReportContext";
import { useProductContext } from "../../context/ProductContext";
import { useSelectedProductInEditContext } from "../../context/SelectedProductInEditContext";
import Toast from "react-native-toast-message";

const CustomerReportScreen = ({
  route,
  navigation,
}: CustomerReportScreenProp) => {
  const params = route.params;
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const { products, updateProduct } = useProductContext();
  const { setSelectedProductListInEdit } = useSelectedProductInEditContext();
  return (
    <View
      style={[
        styles.container,
        { opacity: isConfirmationModalVisible ? 0.1 : 1 },
      ]}
    >
      <InfoHorizontal
        label="Customer name"
        value={params.customer?.customerName!}
      />
      <InfoHorizontal
        label="Cash Payment"
        value={`₱ ${params.cashPayment.trim() ? params.cashPayment : "0"}`}
      />
      <InfoHorizontal
        label="Online Payment"
        value={`₱ ${params.onlinePayment.trim() ? params.onlinePayment : "0"}`}
      />
      <InfoHorizontal
        label="Date bought"
        value={readableDate(new Date(params.date!))}
      />
      <InfoHorizontal
        label="Discount"
        value={`₱${params.discount.trim() ? params.discount : "0"}`}
      />
      <InfoHorizontal
        label="Freebies"
        value={`₱${params.freebies.trim() ? params.freebies : "0"}`}
      />
      <InfoHorizontal
        label="Total amount"
        value={`₱${calculateTotalPrice(params.selectedProducts).toFixed(2)}`}
      />
      <InfoHorizontal
        label="Total profit"
        value={`₱${calculateTotalProfit(
          params.selectedProducts,
          parseFloat(params.discount.trim() ? params.discount : "0"),
          parseFloat(params.freebies.trim() ? params.freebies : "0")
        ).toFixed(2)}`}
      />
      <Text style={styles.productsBoughtStyle}>Products Bought</Text>

      <View style={styles.rowFormat}>
        <Text style={[styles.invoiceLabel, { flex: 2 }]}>Description</Text>
        <Text style={[styles.invoiceLabel, { flex: 1, textAlign: "center" }]}>
          Qty
        </Text>
        <Text style={[styles.invoiceLabel, { flex: 1 }]}>Price</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
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
      <View style={styles.buttonContainer}>
        <Button
          icon={<Entypo name="trash" size={24} color="#F3F0E9" />}
          buttonStyle={styles.buttonStyle}
          onPress={() => setIsConfirmationModalVisible(true)}
        />
        {params.fromSales && (
          <Button
            icon={<Entypo name="edit" size={24} color="#F3F0E9" />}
            buttonStyle={styles.buttonStyle}
            onPress={() => {
              navigation.navigate("EditCustomerReportTabScreen", params);
              setSelectedProductListInEdit(params.selectedProducts);
            }}
          />
        )}
      </View>
      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        setIsVisible={setIsConfirmationModalVisible}
        cancelFn={() => setIsConfirmationModalVisible(false)}
        confirmFn={() => {
          deleteSalesReportData(
            params.id,
            salesReports,
            setSalesReportList,
            products,
            updateProduct
          );
          setIsConfirmationModalVisible(false);
          navigation.goBack();
        }}
        confirmationTitle="Delete this report?"
        confirmationDescription={`Delete purchase info of ${params.customer?.customerName}`}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default CustomerReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
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
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    marginHorizontal: wp(2),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: hp(2),
  },
});
