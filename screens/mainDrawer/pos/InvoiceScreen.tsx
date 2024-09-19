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

  const viewRef = useRef<View>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [snapshotVisible, setSnapshotVisible] = useState(true);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  if (permissionResponse === null) {
    requestPermission();
  }

  const captureAndHandle = async (action: "save" | "print") => {
    try {
      setSnapshotVisible(false);
      // Capture the view;
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });
      console.log(uri);
      await MediaLibrary.saveToLibraryAsync(uri);

      console.log("Success", "Image saved to gallery!");

      setSnapshotVisible(true);
    } catch (error) {
      console.error("Failed to capture and handle image:", error);
      setSnapshotVisible(true);
    }
  };
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
          } else {
            //show error
          }
        }}
      />

      <InvoiceModal
        isVisible={isInvoiceVisible}
        setIsVisible={setIsInvoiceVisible}
        selectedProducts={selectedProducts}
        deliveryFee={invoiceFormInfo.deliveryFee}
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
