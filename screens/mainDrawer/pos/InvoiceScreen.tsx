import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import SummaryForm from "../../../components/SummaryForm";
import { InvoiceForm, InvoiceScreenProp } from "../../../types/type";
import InvoiceModal from "../../../components/InvoiceModal";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomerListModal from "../../../components/CustomerListModal";
import { useCustomerContext } from "../../../context/CustomerContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateInvoice } from "../../../methods/time-methods/onChangeDate";
import { addSalesReportData } from "../../../methods/data-methods/addSalesReportData";
import { useProductContext } from "../../../context/ProductContext";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";

const InvoiceScreen = ({ navigation, route }: InvoiceScreenProp) => {
  const params = route.params;
  const { selectedProducts, setSelectedProductList } =
    useSelectedProductContext();
  const { products, updateProduct } = useProductContext();
  const { addSalesReport } = useSalesReportContext();
  const [invoiceFormInfo, setInvoiceFormInfo] = useState<InvoiceForm>({
    cashPayment: "",
    onlinePayment: "",
    customer: null,
    date: null,
    discount: "",
    freebies: "",
    deliveryFee: "",
  });
  const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
  //for customers in modal
  const { customers, setCustomerList } = useCustomerContext();
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  //date
  const [isDateVisible, setIsDateVisible] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");

  useEffect(() => {
    if (params)
      setInvoiceFormInfo((prev) => ({
        ...prev,
        customer: params,
      }));
  }, [params]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  if (permissionResponse === null) {
    requestPermission();
  }
  const { showToast } = useToastContext();

  return (
    <View
      style={[
        styles.container,
        { opacity: isInvoiceVisible || isCustomerListVisible ? 0.1 : 1 },
      ]}
    >
      <SummaryForm
        invoiceFormInfo={invoiceFormInfo}
        setInvoiceFormInfo={setInvoiceFormInfo}
        deleteInputValuesFn={() =>
          setInvoiceFormInfo({
            cashPayment: "",
            onlinePayment: "",
            customer: null,
            date: null,
            discount: "",
            freebies: "",
            deliveryFee: "",
          })
        }
        selectedProducts={selectedProducts}
        previewInvoiceFn={() => setIsInvoiceVisible(true)}
        customerModalVisibleFn={() => setIsCustomerListVisible(true)}
        dateInvoiceFn={() => setIsDateVisible(true)}
        submitSummaryFormFn={() => {
          if (
            invoiceFormInfo.customer &&
            (invoiceFormInfo.cashPayment || invoiceFormInfo.onlinePayment) &&
            invoiceFormInfo.date
          ) {
            addSalesReportData(
              selectedProducts,
              invoiceFormInfo,
              products,
              updateProduct,
              addSalesReport
            );
            setSelectedProductList([]);
            setInvoiceFormInfo({
              cashPayment: "",
              onlinePayment: "",
              customer: null,
              date: null,
              discount: "",
              freebies: "",
              deliveryFee: "",
            });
            showToast("success", "Invoice added successfully");
          } else {
            showToast(
              "error",
              "Incomplete Field",
              "Please fill the missing fields"
            );
          }
        }}
      />

      <InvoiceModal
        isVisible={isInvoiceVisible}
        setIsVisible={setIsInvoiceVisible}
        selectedProducts={selectedProducts}
        deliveryFee={invoiceFormInfo.deliveryFee}
        discount={invoiceFormInfo.discount}
      />
      <CustomerListModal
        isVisible={isCustomerListVisible}
        setIsVisible={() => setIsCustomerListVisible(!isCustomerListVisible)}
        customers={customers}
        setCustomerList={setCustomerList}
        searchQuery={customerSearchQuery}
        setSearchQuery={setCustomerSearchQuery}
        navigation={navigation}
        setInvoiceFormInfo={setInvoiceFormInfo}
      />
      {isDateVisible && (
        <DateTimePicker
          value={invoiceFormInfo.date ? invoiceFormInfo.date : new Date()}
          mode={mode}
          onChange={onChangeDateInvoice(
            setIsDateVisible,
            setInvoiceFormInfo,
            mode,
            setMode
          )}
        />
      )}
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    justifyContent: "center",
    backgroundColor: "#F3F0E9",
  },
});
