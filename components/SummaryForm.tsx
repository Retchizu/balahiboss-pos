import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InputFormWithLabel from "./InputFormWithLabel";
import ButtonFormWithLabel from "./ButtonFormWithLabel";
import { Button } from "@rneui/base";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { InvoiceForm, SelectedProduct } from "../types/type";
import { handleInputChange } from "../methods/handleInputChange";
import { calculateTotalPrice } from "../methods/calculation-methods/calculateTotalPrice";
import { calculateTotalProfit } from "../methods/calculation-methods/calculateTotalProfit";
import { readableDate } from "../methods/time-methods/readableDate";
import { readableTime } from "../methods/time-methods/readableTime";

type SummaryFormProps = {
  invoiceFormInfo: InvoiceForm;
  setInvoiceFormInfo: React.Dispatch<React.SetStateAction<InvoiceForm>>;
  deleteInputValuesFn: () => void;
  previewInvoiceFn?: () => void;
  dateInvoiceFn: () => void;
  timeInvoiceFn: () => void;
  submitSummaryFormFn: () => Promise<void>;
  selectedProducts: SelectedProduct[];
  customerModalVisibleFn: () => void;
  setIsSaveModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
};

const SummaryForm = ({
  invoiceFormInfo,
  setInvoiceFormInfo,
  deleteInputValuesFn,
  previewInvoiceFn,
  selectedProducts,
  customerModalVisibleFn,
  dateInvoiceFn,
  timeInvoiceFn,
  submitSummaryFormFn,
  setIsSaveModalVisible,
}: SummaryFormProps) => {
  return (
    <View style={styles.summaryFormContainer}>
      <View style={styles.summaryHeaderContainer}>
        <Text style={{ fontFamily: "SoraSemiBold", fontSize: wp(6) }}>
          Invoice Form
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {setIsSaveModalVisible && (
            <TouchableOpacity
              style={{
                marginHorizontal: wp(1.5),
              }}
              onPress={() => setIsSaveModalVisible(true)}
            >
              <Fontisto name="save" size={28} color="#634F40" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            style={{ marginHorizontal: wp(1.5) }}
            onPress={() => deleteInputValuesFn()}
          >
            <MaterialCommunityIcons
              name="tag-minus"
              size={28}
              color="#634F40"
            />
          </TouchableOpacity>
          {previewInvoiceFn && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ marginHorizontal: wp(1.5) }}
              onPress={() => previewInvoiceFn()}
            >
              <Fontisto name="preview" size={28} color="#634F40" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.viewWithRows}>
        <InputFormWithLabel
          formLabel="Cash Payment"
          textInputProp={{
            placeholder: "Cash Payment",
            keyboardType: "numeric",
            value: invoiceFormInfo.cashPayment,
            onChangeText: (text) =>
              handleInputChange("cashPayment", text, setInvoiceFormInfo),
            contextMenuHidden: true,
          }}
          viewStyle={styles.viewStyleWithMargin}
        />
        <InputFormWithLabel
          formLabel="Online Payment"
          textInputProp={{
            placeholder: "Online Payment",
            keyboardType: "numeric",
            value: invoiceFormInfo.onlinePayment,
            onChangeText: (text) =>
              handleInputChange("onlinePayment", text, setInvoiceFormInfo),

            contextMenuHidden: true,
          }}
          viewStyle={styles.viewstyleWithoutMargin}
        />
      </View>
      <InputFormWithLabel
        formLabel="Delivery Fee"
        textInputProp={{
          placeholder: "Delivery Fee",
          keyboardType: "numeric",
          value: invoiceFormInfo.deliveryFee,
          onChangeText: (text) =>
            handleInputChange("deliveryFee", text, setInvoiceFormInfo),
          contextMenuHidden: true,
        }}
        viewStyle={styles.viewstyleWithoutMargin}
      />
      <ButtonFormWithLabel
        formLabel="Customer"
        title={invoiceFormInfo.customer?.customerName ?? "Select Customer"}
        onPress={() => customerModalVisibleFn()}
        viewStyle={styles.viewStyleWithMargin}
      />

      <View style={styles.viewWithRows}>
        <ButtonFormWithLabel
          formLabel="Date"
          title={
            invoiceFormInfo.date ? readableDate(invoiceFormInfo.date) : "Date"
          }
          onPress={() => dateInvoiceFn()}
          viewStyle={styles.viewStyleWithMargin}
        />
        <ButtonFormWithLabel
          formLabel="Time"
          title={
            invoiceFormInfo.date ? readableTime(invoiceFormInfo.date) : "Time"
          }
          onPress={() => timeInvoiceFn()}
          viewStyle={styles.viewstyleWithoutMargin}
        />
      </View>

      <View style={styles.viewWithRows}>
        <InputFormWithLabel
          formLabel="Discount"
          textInputProp={{
            placeholder: "Discount",
            keyboardType: "numeric",
            value: invoiceFormInfo.discount,
            onChangeText: (text) =>
              handleInputChange("discount", text, setInvoiceFormInfo),

            contextMenuHidden: true,
          }}
          viewStyle={styles.viewStyleWithMargin}
        />

        <InputFormWithLabel
          formLabel="Freebies"
          textInputProp={{
            placeholder: "Freebies",
            keyboardType: "numeric",
            value: invoiceFormInfo.freebies,
            onChangeText: (text) =>
              handleInputChange("freebies", text, setInvoiceFormInfo),
            contextMenuHidden: true,
          }}
          viewStyle={styles.viewstyleWithoutMargin}
        />
      </View>

      <View style={[styles.viewWithRows, { paddingTop: hp(1) }]}>
        <Text style={[styles.label, { flex: 1.5 }]}>Total Price:</Text>
        <Text style={[styles.label, { flex: 2.5 }]}>
          ₱{" "}
          {calculateTotalPrice(
            selectedProducts,
            undefined,
            parseFloat(invoiceFormInfo.discount)
          ).toFixed(2)}
        </Text>
      </View>

      <View style={styles.viewWithRows}>
        <Text style={[styles.label, { flex: 1.5 }]}>Total Profit:</Text>
        <Text style={[styles.label, { flex: 2.5 }]}>
          ₱{" "}
          {calculateTotalProfit(
            selectedProducts,
            parseFloat(
              invoiceFormInfo.discount.trim() ? invoiceFormInfo.discount : "0"
            ),
            parseFloat(
              invoiceFormInfo.freebies.trim() ? invoiceFormInfo.freebies : "0"
            )
          ).toFixed(2)}
        </Text>
      </View>

      <Button
        title={"Confirm"}
        buttonStyle={styles.buttonStyle}
        titleStyle={styles.titleStyle}
        onPress={async () => await submitSummaryFormFn()}
      />
    </View>
  );
};

export default SummaryForm;

const styles = StyleSheet.create({
  summaryFormContainer: {
    padding: wp(2),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    color: "#F3F0E9",
    fontSize: wp(4),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    marginVertical: hp(1),
  },
  summaryHeaderContainer: {
    paddingVertical: wp(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#634F40",
    borderBottomWidth: wp(0.2),
    marginBottom: hp(2),
  },
  label: {
    fontFamily: "SoraMedium",
    fontSize: wp(4.5),
  },
  viewWithRows: {
    flexDirection: "row",
  },
  viewStyleWithMargin: { flex: 1, marginRight: wp(1) },
  viewstyleWithoutMargin: { flex: 1 },
});
