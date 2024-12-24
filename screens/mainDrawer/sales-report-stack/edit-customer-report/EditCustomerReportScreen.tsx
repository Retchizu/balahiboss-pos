import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { InvoiceForm, SelectedProduct } from "../../../../types/type";
import SummaryForm from "../../../../components/SummaryForm";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
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
import { useCurrentSalesReportContext } from "../../../../context/CurrentSalesReportContext";

const EditCustomerReportScreen = () => {
  const { currentSalesReport, updateCurrentSalesReport } =
    useCurrentSalesReportContext();
  const [invoiceFormInfoEdit, setInvoiceFormInfoEdit] = useState<InvoiceForm>({
    cashPayment: currentSalesReport!.cashPayment,
    onlinePayment: currentSalesReport!.onlinePayment,
    customer: currentSalesReport!.customer,
    date: currentSalesReport!.date ? new Date(currentSalesReport!.date) : null,
    deliveryFee: currentSalesReport!.deliveryFee,
    discount: currentSalesReport!.discount,
    freebies: currentSalesReport!.freebies,
  });
  const { selectedProductsInEdit } = useSelectedProductInEditContext();
  const { setProductListInEdit, productsInEdit } = useProductInEditContext();
  const { products } = useProductContext();
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

  const [loading, setLoading] = useState(false);

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
            loading={loading}
            submitSummaryFormFn={async () => {
              setLoading(true);
              const currentSalesReportSelectedProductsMap = new Map<
                string,
                SelectedProduct
              >();
              currentSalesReport!.selectedProducts.forEach(
                (selectedProduct) => {
                  currentSalesReportSelectedProductsMap.set(
                    selectedProduct.id,
                    selectedProduct
                  );
                }
              );
              await updateSalesReportData(
                currentSalesReport!.id,
                invoiceFormInfoEdit,
                selectedProductsInEdit,
                productsInEdit,
                updateSalesReport,
                currentSalesReportSelectedProductsMap,
                updateCurrentSalesReport,
                showToast,
                user
              );
              setLoading(false);
              /*  submitSummaryReportInEdit(
                selectedProductsInEdit,
                invoiceFormInfoEdit,
                navigation,
                updateSalesReportData,
                currentSalesReport!,
                productsInEdit,
                updateSalesReport,
                showToast,
                user
              ) */
            }}
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
        isLoadingCustomerFetch={isLoadingCustomerFetch}
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
