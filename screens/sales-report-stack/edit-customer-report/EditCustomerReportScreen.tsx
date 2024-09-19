import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { EditCustomerReportScreenProp, InvoiceForm } from "../../../types/type";
import SummaryForm from "../../../components/SummaryForm";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelectedProductInEditContext } from "../../../context/SelectedProductInEditContext";
import { useCustomerContext } from "../../../context/CustomerContext";
import CustomerListModal from "../../../components/CustomerListModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateInvoice } from "../../../methods/time-methods/onChangeDate";
import { setProductListInEditScreen } from "../../../methods/product-manipulation-methods/setProductListInEditScreen";
import { useProductInEditContext } from "../../../context/ProductInEditContext";
import { useProductContext } from "../../../context/ProductContext";
import { updateSalesReportData } from "../../../methods/data-methods/updateSalesReportData";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { CommonActions } from "@react-navigation/native";

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
  //date
  const [isDateVisible, setIsDateVisible] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");

  useEffect(() => {
    setProductListInEditScreen(
      setProductListInEdit,
      products,
      selectedProductsInEdit
    );
  }, []);

  return (
    <View style={styles.container}>
      <SummaryForm
        invoiceFormInfo={invoiceFormInfoEdit}
        setInvoiceFormInfo={setInvoiceFormInfoEdit}
        selectedProducts={selectedProductsInEdit}
        customerModalVisibleFn={() => {
          setIsCustomerListVisible(true);
        }}
        dateInvoiceFn={() => setIsDateVisible(true)}
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
        submitSummaryFormFn={() => {
          updateSalesReportData(
            invoiceForm.id,
            invoiceFormInfoEdit,
            selectedProductsInEdit,
            productsInEdit,
            updateProduct,
            updateSalesReport,
            invoiceForm.selectedProducts
          );
          setSelectedProductListInEdit([]);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: "SalesReportScreen" },
                {
                  name: "CustomerReportScreen",
                  params: {
                    id: invoiceForm.id,
                    cashPayment: invoiceFormInfoEdit.cashPayment,
                    onlinePayment: invoiceFormInfoEdit.onlinePayment,
                    customer: invoiceFormInfoEdit.customer,
                    date: invoiceFormInfoEdit.date?.toISOString(),
                    discount: invoiceFormInfoEdit.discount,
                    freebies: invoiceFormInfoEdit.freebies,
                    deliveryFee: invoiceFormInfoEdit.deliveryFee,
                    selectedProducts: selectedProductsInEdit,
                  },
                },
              ],
            })
          );
        }}
      />
      <CustomerListModal
        isVisible={isCustomerListVisible}
        setIsVisible={() => setIsCustomerListVisible(!isCustomerListVisible)}
        customers={customers}
        setCustomerList={setCustomerList}
        searchQuery={customerSearchQuery}
        setSearchQuery={setCustomerSearchQuery}
        setInvoiceFormInfo={setInvoiceFormInfoEdit}
      />
      {isDateVisible && (
        <DateTimePicker
          value={
            invoiceFormInfoEdit.date ? invoiceFormInfoEdit.date : new Date()
          }
          mode={mode}
          onChange={onChangeDateInvoice(
            setIsDateVisible,
            setInvoiceFormInfoEdit,
            mode,
            setMode
          )}
        />
      )}
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
