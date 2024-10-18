import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  EditCustomerReportScreenProp,
  InvoiceForm,
} from "../../../../types/type";
import SummaryForm from "../../../../components/SummaryForm";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelectedProductInEditContext } from "../../../../context/SelectedProductInEditContext";
import { useCustomerContext } from "../../../../context/CustomerContext";
import CustomerListModal from "../../../../components/CustomerListModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateInvoice } from "../../../../methods/time-methods/onChangeDate";
import { setProductListInEditScreen } from "../../../../methods/product-manipulation-methods/setProductListInEditScreen";
import { useProductInEditContext } from "../../../../context/ProductInEditContext";
import { useProductContext } from "../../../../context/ProductContext";
import { updateSalesReportData } from "../../../../methods/data-methods/updateSalesReportData";
import { useSalesReportContext } from "../../../../context/SalesReportContext";
import { useToastContext } from "../../../../context/ToastContext";
import { useUserContext } from "../../../../context/UserContext";
import { filterSearchForCustomer } from "../../../../methods/search-filters/fitlerSearchForCustomer";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { submitSummaryReportInEdit } from "../../../../methods/submit-sales-method/submitSummaryReportInEdit";

const EditCustomerReportScreen = ({
  route,
  navigation,
}: EditCustomerReportScreenProp) => {
  const invoiceForm = route.params;
  const [invoiceFormInfoEdit, setInvoiceFormInfoEdit] = useState<InvoiceForm>({
    cashPayment: invoiceForm.cashPayment,
    onlinePayment: invoiceForm.onlinePayment,
    customer: invoiceForm.customer,
    date: invoiceForm.date ? new Date(invoiceForm.date) : null,
    deliveryFee: invoiceForm.deliveryFee,
    discount: invoiceForm.discount,
    freebies: invoiceForm.freebies,
  });
  const { selectedProductsInEdit, setSelectedProductListInEdit } =
    useSelectedProductInEditContext();
  const { setProductListInEdit, productsInEdit } = useProductInEditContext();
  const { products, updateProduct, setProductList } = useProductContext();
  const { updateSalesReport } = useSalesReportContext();

  //for customers in modal
  const { customers, setCustomerList } = useCustomerContext();
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isLoadingCustomerFetch, setIsLoadingCustomerFetch] = useState(false);
  //date
  const [isDateVisible, setIsDateVisible] = useState(false);
  const [isTimeVisible, setIsTimeVisible] = useState(false);

  const { showToast } = useToastContext();
  const { user } = useUserContext();

  useEffect(() => {
    setProductListInEditScreen(
      setProductListInEdit,
      products,
      selectedProductsInEdit
    );
  }, []);

  const filteredCustomerData = filterSearchForCustomer(
    customers,
    customerSearchQuery
  );

  return (
    <View style={styles.container}>
      <View>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <SummaryForm
            invoiceFormInfo={invoiceFormInfoEdit}
            setInvoiceFormInfo={setInvoiceFormInfoEdit}
            selectedProducts={selectedProductsInEdit}
            customerModalVisibleFn={() => {
              setIsCustomerListVisible(true);
            }}
            dateInvoiceFn={() => setIsDateVisible(true)}
            timeInvoiceFn={() => setIsTimeVisible(true)}
            deleteInputValuesFn={() =>
              setInvoiceFormInfoEdit({
                cashPayment: "",
                onlinePayment: "",
                customer: null,
                date: null,
                discount: "",
                freebies: "",
                deliveryFee: "",
              })
            }
            submitSummaryFormFn={() =>
              submitSummaryReportInEdit(
                selectedProductsInEdit,
                setSelectedProductListInEdit,
                invoiceFormInfoEdit,
                navigation,
                updateSalesReportData,
                invoiceForm,
                productsInEdit,
                updateProduct,
                updateSalesReport,
                showToast,
                user
              )
            }
          />
        </KeyboardAwareScrollView>
      </View>
      <CustomerListModal
        isVisible={isCustomerListVisible}
        setIsVisible={() => setIsCustomerListVisible(!isCustomerListVisible)}
        customers={filteredCustomerData}
        setCustomerList={setCustomerList}
        searchQuery={customerSearchQuery}
        setSearchQuery={setCustomerSearchQuery}
        setInvoiceFormInfo={setInvoiceFormInfoEdit}
        user={user}
        showToast={showToast}
        setIsLoadingCustomerFetch={setIsLoadingCustomerFetch}
      />
      {isDateVisible && (
        <DateTimePicker
          value={
            invoiceFormInfoEdit.date ? invoiceFormInfoEdit.date : new Date()
          }
          mode={"date"}
          onChange={onChangeDateInvoice(
            setIsDateVisible,
            setInvoiceFormInfoEdit
          )}
        />
      )}

      {isTimeVisible && (
        <DateTimePicker
          value={
            invoiceFormInfoEdit.date ? invoiceFormInfoEdit.date : new Date()
          }
          mode={"time"}
          onChange={onChangeDateInvoice(
            setIsTimeVisible,
            setInvoiceFormInfoEdit
          )}
        />
      )}
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default EditCustomerReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    justifyContent: "center",
    backgroundColor: "#F3F0E9",
  },
});
