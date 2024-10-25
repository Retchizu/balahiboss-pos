import { CommonActions } from "@react-navigation/native";
import {
  CustomerReportParams,
  EditCustomerReportTabParamList,
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
  User,
} from "../../types/type";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ToastType } from "react-native-toast-message";
import { BackHandler } from "react-native";

export const submitSummaryReportInEdit = async (
  selectedProductsInEdit: SelectedProduct[],
  setSelectedProductListInEdit: (newProductList: SelectedProduct[]) => void,
  invoiceFormInfoEdit: InvoiceForm,
  navigation: BottomTabNavigationProp<
    EditCustomerReportTabParamList,
    "EditCustomerReportScreen",
    undefined
  >,
  updateSalesReportData: (
    salesReportId: string,
    invoiceForm: InvoiceForm,
    selectedProducts: SelectedProduct[],
    products: Product[],
    updateProduct: (productId: String, attribute: Partial<Product>) => void,
    updateSalesReport: (
      reportId: String,
      attribute: Partial<SalesReport>
    ) => void,
    originalSelectedProducts: SelectedProduct[],
    showToast: (type: ToastType, text1: string, text2?: string) => void,
    user: User | null
  ) => Promise<void>,
  invoiceForm: Readonly<CustomerReportParams>,
  productsInEdit: Product[],
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  updateSalesReport: (
    reportId: String,
    attribute: Partial<SalesReport>
  ) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  await updateSalesReportData(
    invoiceForm.id,
    invoiceFormInfoEdit,
    selectedProductsInEdit,
    productsInEdit,
    updateProduct,
    updateSalesReport,
    invoiceForm.selectedProducts,
    showToast,
    user
  );
  setTimeout(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => false
    );
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
              fromSales: true,
            },
          },
        ],
      })
    );
    return () => {
      backHandler.remove();
    };
  }, 900);
};
