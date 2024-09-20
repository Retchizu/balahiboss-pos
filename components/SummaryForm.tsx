import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import { Customer, InvoiceForm, SelectedProduct } from "../types/type";
import { handleInputChange } from "../methods/handleInputChange";
import { calculateTotalPrice } from "../methods/calculation-methods/calculateTotalPrice";
import { calculateTotalProfit } from "../methods/calculation-methods/calculateTotalProfit";
import { readableDate } from "../methods/time-methods/readableDate";

type SummaryFormProps = {
  invoiceFormInfo: InvoiceForm;
  setInvoiceFormInfo: React.Dispatch<React.SetStateAction<InvoiceForm>>;
  deleteInputValuesFn: () => void;
  previewInvoiceFn?: () => void;
  dateInvoiceFn: () => void;
  submitSummaryFormFn: () => void;
  selectedProducts: SelectedProduct[];
  customerModalVisibleFn: () => void;
};

const SummaryForm = ({
  invoiceFormInfo,
  setInvoiceFormInfo,
  deleteInputValuesFn,
  previewInvoiceFn,
  selectedProducts,
  customerModalVisibleFn,
  dateInvoiceFn,
  submitSummaryFormFn,
}: SummaryFormProps) => {
  return (
    <View style={styles.summaryFormContainer}>
      <ScrollView>
        <View style={styles.summaryHeaderContainer}>
          <Text style={{ fontFamily: "SoraSemiBold", fontSize: wp(5) }}>
            Invoice Form
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ marginHorizontal: wp(2) }}
              onPress={() => deleteInputValuesFn()}
            >
              <MaterialCommunityIcons
                name="tag-minus"
                size={26}
                color="#634F40"
              />
            </TouchableOpacity>
            {previewInvoiceFn && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ marginHorizontal: wp(2) }}
                onPress={() => previewInvoiceFn()}
              >
                <Fontisto name="preview" size={26} color="#634F40" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <InputFormWithLabel
          formLabel="Cash Payment"
          placeholder="Cash Payment"
          keyboardType="numeric"
          value={invoiceFormInfo.cashPayment}
          onChangeText={(text) =>
            handleInputChange("cashPayment", text, setInvoiceFormInfo)
          }
        />
        <InputFormWithLabel
          formLabel="Online Payment"
          placeholder="Online Payment"
          keyboardType="numeric"
          value={invoiceFormInfo.onlinePayment}
          onChangeText={(text) =>
            handleInputChange("onlinePayment", text, setInvoiceFormInfo)
          }
        />
        <ButtonFormWithLabel
          formLabel="Customer"
          title={invoiceFormInfo.customer?.customerName ?? "Select Customer"}
          onPress={() => customerModalVisibleFn()}
        />
        <ButtonFormWithLabel
          formLabel="Date"
          title={
            invoiceFormInfo.date ? readableDate(invoiceFormInfo.date) : "Date"
          }
          onPress={() => dateInvoiceFn()}
        />
        <InputFormWithLabel
          formLabel="Discount"
          placeholder="Discount"
          keyboardType="numeric"
          value={invoiceFormInfo.discount}
          onChangeText={(text) =>
            handleInputChange("discount", text, setInvoiceFormInfo)
          }
        />
        <InputFormWithLabel
          formLabel="Freebies"
          placeholder="Freebies"
          keyboardType="numeric"
          value={invoiceFormInfo.freebies}
          onChangeText={(text) =>
            handleInputChange("freebies", text, setInvoiceFormInfo)
          }
        />
        <InputFormWithLabel
          formLabel="Delivery Fee"
          placeholder="Delivery Fee (for invoice)"
          keyboardType="numeric"
          value={invoiceFormInfo.deliveryFee}
          onChangeText={(text) =>
            handleInputChange("deliveryFee", text, setInvoiceFormInfo)
          }
        />
        <View style={{ flexDirection: "row" }}>
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

        <View style={{ flexDirection: "row" }}>
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
          onPress={() => submitSummaryFormFn()}
        />
      </ScrollView>
    </View>
  );
};

export default SummaryForm;

const styles = StyleSheet.create({
  summaryFormContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(1),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    color: "#F3F0E9",
    fontSize: wp(3.5),
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
  },
  label: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.7),
  },
});
