import { ToastType } from "react-native-toast-message";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
  User,
} from "../../types/type";

export const submitSummaryReport = async (
  selectedProducts: SelectedProduct[],
  invoiceFormInfo: InvoiceForm,
  setInvoiceFormInfo: React.Dispatch<React.SetStateAction<InvoiceForm>>,
  products: Product[],
  updateProduct: (productId: string, attribute: Partial<Product>) => void,
  addSalesReport: (newReport: SalesReport) => void,
  addSalesReportData: (
    selectedProducts: SelectedProduct[],
    invoiceForm: InvoiceForm,
    products: Product[],
    updateProduct: (productId: string, attribute: Partial<Product>) => void,
    addSalesReport: (newReport: SalesReport) => void,
    showToast: (type: ToastType, text1: string, text2?: string) => void,
    user: User | null
  ) => Promise<void>,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null,
  setSelectedProductList: (products: SelectedProduct[]) => void
) => {
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
    showToast("error", "Incomplete Field", "Please fill the missing fields");
  }
};
