import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import SummaryForm from "../../../components/SummaryForm";
import { Device, InvoiceForm, InvoiceScreenProp } from "../../../types/type";
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
import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";
import { filterSearchForCustomer } from "../../../methods/search-filters/fitlerSearchForCustomer";
import BluetoothDeviceListModal from "../../../components/BluetoothDeviceListModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../../../context/UserContext";

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
  const [printButtonVisibility, setPrintButtonVisibilty] = useState(false);
  const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
  const [
    isBluetoothDeviceListModalVisible,
    setIsBluetoothDeviceListModalVisible,
  ] = useState(false);
  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  //for customers in modal
  const { customers, setCustomerList } = useCustomerContext();
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  //date
  const [isDateVisible, setIsDateVisible] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [pairedDevices, setPairedDevices] = useState<Device[]>([]);
  const [currentPrinter, setCurrentPrinter] = useState<Device>();

  useEffect(() => {
    const loadPrinter = async () => {
      try {
        const printerData = await AsyncStorage.getItem("printer");
        if (printerData !== null) {
          setCurrentPrinter(JSON.parse(printerData));
        }
      } catch (error) {
        showToast(
          "error",
          "Select a new printer",
          "Error loading previous printer"
        );
      }
    };

    loadPrinter();
  }, []);

  useEffect(() => {
    if (params)
      setInvoiceFormInfo((prev) => ({
        ...prev,
        customer: params,
      }));
  }, [params]);

  if (permissionResponse === null) {
    requestPermission();
  }

  const filteredCustomerData = filterSearchForCustomer(
    customers,
    customerSearchQuery
  );

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
        submitSummaryFormFn={async () => {
          if (
            invoiceFormInfo.customer &&
            (invoiceFormInfo.cashPayment || invoiceFormInfo.onlinePayment) &&
            invoiceFormInfo.date
          ) {
            await addSalesReportData(
              selectedProducts,
              invoiceFormInfo,
              products,
              updateProduct,
              addSalesReport,
              showToast,
              user
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
        isInvoiceVisible={isInvoiceVisible}
        setIsInvoiceVisible={setIsInvoiceVisible}
        selectedProducts={selectedProducts}
        deliveryFee={invoiceFormInfo.deliveryFee}
        discount={invoiceFormInfo.discount}
        showToast={showToast}
        setIsBluetoothDeviceListModalVisible={
          setIsBluetoothDeviceListModalVisible
        }
        setPairedDevice={setPairedDevices}
        setPrintButtonVisibility={setPrintButtonVisibilty}
      />
      <BluetoothDeviceListModal
        isBluetoothDeviceListModalVisible={isBluetoothDeviceListModalVisible}
        printButtonVisibility={printButtonVisibility}
        setIsBluetoothDeviceListModalVisible={
          setIsBluetoothDeviceListModalVisible
        }
        setIsInvoiceModalVisible={setIsInvoiceVisible}
        pairedDevices={pairedDevices}
        deliveryFee={invoiceFormInfo.deliveryFee}
        discount={invoiceFormInfo.discount}
        invoiceDate={invoiceFormInfo.date!}
        selectedProducts={selectedProducts}
        showToast={showToast}
        currentPrinter={currentPrinter}
        setCurrentPrinter={setCurrentPrinter}
        setPrintButtonVisibility={setPrintButtonVisibilty}
        setPairedDevice={setPairedDevices}
      />
      <CustomerListModal
        isVisible={isCustomerListVisible}
        setIsVisible={() => setIsCustomerListVisible(!isCustomerListVisible)}
        customers={filteredCustomerData}
        setCustomerList={setCustomerList}
        searchQuery={customerSearchQuery}
        setSearchQuery={setCustomerSearchQuery}
        navigation={navigation}
        setInvoiceFormInfo={setInvoiceFormInfo}
        user={user}
      />
      {isDateVisible && (
        <DateTimePicker
          value={invoiceFormInfo.date ? invoiceFormInfo.date : new Date()}
          mode={mode}
          negativeButton={{ label: "" }}
          positiveButton={{ label: "next" }}
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
