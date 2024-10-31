import { StyleSheet, View } from "react-native";
import { useState } from "react";
import SummaryForm from "../../../components/SummaryForm";
import { InvoiceScreenProp } from "../../../types/type";
import InvoiceModal from "../../../components/InvoiceModal";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
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
import BluetoothDeviceListModal from "../../../components/BluetoothDeviceListModal";
import { useUserContext } from "../../../context/UserContext";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { submitSummaryReport } from "../../../methods/submit-sales-method/submitSummaryReport";
import { useInvoiceForm } from "../../../hooks/invoice-hooks/useInvoiceForm";
import { useBluetoothPrinter } from "../../../hooks/invoice-hooks/useBluetoothPrinter";
import { useCustomerListManager } from "../../../hooks/invoice-hooks/useCustomerListManager";
import SaveDraftModal from "../../../components/SaveDraftModal";
import { useDraftContext } from "../../../context/DraftContext";
import { handleSaveDraft } from "../../../methods/handleSaveDraft";

const InvoiceScreen: React.FC<InvoiceScreenProp> = ({
  navigation,
  route,
}: InvoiceScreenProp) => {
  const params = route.params;

  //context
  const { selectedProducts, setSelectedProductList } =
    useSelectedProductContext();
  const { products, updateProduct } = useProductContext();
  const { addSalesReport } = useSalesReportContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  //custom hooks
  const { invoiceForm, setInvoiceForm, resetForm } = useInvoiceForm(params);
  const { pairedDevices, setPairedDevices, currentPrinter, setCurrentPrinter } =
    useBluetoothPrinter();

  //invoice modal
  const [printButtonVisibility, setPrintButtonVisibilty] = useState(false);
  const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
  const [
    isBluetoothDeviceListModalVisible,
    setIsBluetoothDeviceListModalVisible,
  ] = useState(false);

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  //for customers in modal
  const { customers, setCustomerList } = useCustomerContext();
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const [isLoadingCustomerFetch, setIsLoadingCustomerFetch] = useState(false);

  const { filteredCustomerData, customerSearchQuery, setCustomerSearchQuery } =
    useCustomerListManager(customers);

  //date
  const [isDateVisible, setIsDateVisible] = useState(false);
  const [isTimeVisible, setIsTimeVisible] = useState(false);

  //save modal
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const { addDraft } = useDraftContext();

  if (permissionResponse === null) {
    requestPermission();
  }

  return (
    <View
      style={[
        styles.container,
        {
          opacity:
            isInvoiceVisible || isCustomerListVisible || isSaveModalVisible
              ? 0.1
              : 1,
        },
      ]}
    >
      <View>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <SummaryForm
            invoiceFormInfo={invoiceForm}
            setInvoiceFormInfo={setInvoiceForm}
            deleteInputValuesFn={() => resetForm()}
            selectedProducts={selectedProducts}
            previewInvoiceFn={() => setIsInvoiceVisible(true)}
            customerModalVisibleFn={() => setIsCustomerListVisible(true)}
            setIsSaveModalVisible={setIsSaveModalVisible}
            dateInvoiceFn={() => setIsDateVisible(true)}
            timeInvoiceFn={() => setIsTimeVisible(true)}
            submitSummaryFormFn={() =>
              submitSummaryReport(
                selectedProducts,
                invoiceForm,
                setInvoiceForm,
                products,
                updateProduct,
                addSalesReport,
                addSalesReportData,
                showToast,
                user,
                setSelectedProductList
              )
            }
          />
        </KeyboardAwareScrollView>
      </View>

      <InvoiceModal
        isInvoiceVisible={isInvoiceVisible}
        setIsInvoiceVisible={setIsInvoiceVisible}
        selectedProducts={selectedProducts}
        deliveryFee={invoiceForm.deliveryFee}
        discount={invoiceForm.discount}
        showToast={showToast}
        setIsBluetoothDeviceListModalVisible={
          setIsBluetoothDeviceListModalVisible
        }
        setPairedDevice={setPairedDevices}
        setPrintButtonVisibility={setPrintButtonVisibilty}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
      <BluetoothDeviceListModal
        isBluetoothDeviceListModalVisible={isBluetoothDeviceListModalVisible}
        printButtonVisibility={printButtonVisibility}
        setIsBluetoothDeviceListModalVisible={
          setIsBluetoothDeviceListModalVisible
        }
        setIsInvoiceModalVisible={setIsInvoiceVisible}
        pairedDevices={pairedDevices}
        deliveryFee={invoiceForm.deliveryFee}
        discount={invoiceForm.discount}
        invoiceDate={invoiceForm.date!}
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
        setInvoiceFormInfo={setInvoiceForm}
        user={user}
        setIsLoadingCustomerFetch={setIsLoadingCustomerFetch}
        isLoadingCustomerFetch={isLoadingCustomerFetch}
        showToast={showToast}
      />

      <SaveDraftModal
        isVisible={isSaveModalVisible}
        setIsVisible={setIsSaveModalVisible}
        draftTitle={draftTitle}
        setDraftTitle={setDraftTitle}
        confirmFn={() =>
          handleSaveDraft(
            draftTitle,
            user,
            invoiceForm,
            selectedProducts,
            addDraft,
            showToast,
            setIsSaveModalVisible,
            setDraftTitle
          )
        }
      />

      {isDateVisible && (
        <DateTimePicker
          value={invoiceForm.date ? invoiceForm.date : new Date()}
          mode={"date"}
          onChange={onChangeDateInvoice(setIsDateVisible, setInvoiceForm)}
        />
      )}
      {isTimeVisible && (
        <DateTimePicker
          value={invoiceForm.date ? invoiceForm.date : new Date()}
          mode={"time"}
          onChange={onChangeDateInvoice(setIsTimeVisible, setInvoiceForm)}
        />
      )}
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    justifyContent: "center",
    backgroundColor: "#F3F0E9",
  },
});
