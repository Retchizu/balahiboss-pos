import { ToastType } from "react-native-toast-message";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SalesReportDataToExcel,
  SelectedProduct,
  StockReportDataToExcel,
  User,
} from "../../types/type";
import { clearSelectedProduct } from "../product-select-methods/clearSelectedProduct";
import { readableDate } from "../time-methods/readableDate";

export const submitSummaryReport = async (
  selectedProducts: Map<string, SelectedProduct>,
  invoiceFormInfo: InvoiceForm,
  setInvoiceFormInfo: React.Dispatch<React.SetStateAction<InvoiceForm>>,
  products: Product[],
  addSalesReport: (newReport: SalesReport) => void,
  addSalesReportData: (
    selectedProducts: Map<string, SelectedProduct>,
    invoiceForm: InvoiceForm,
    products: Product[],
    addSalesReport: (newReport: SalesReport) => void,
    showToast: (type: ToastType, text1: string, text2?: string) => void,
    user: User | null
  ) => Promise<void>,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null,
  setSelectedProductList: (
    newSelectedProductList: Map<string, SelectedProduct>
  ) => void,
  setSalesReportCache: React.Dispatch<
    React.SetStateAction<Map<string, SalesReportDataToExcel[]>>
  >,
  setStockSoldCache: React.Dispatch<
    React.SetStateAction<Map<string, StockReportDataToExcel[]>>
  >
) => {
  if (!selectedProducts.size) {
    showToast(
      "error",
      "Invalid invoice",
      "Cart is empty or item is out of stock."
    );
    return;
  }

  const { customer, cashPayment, onlinePayment, date } = invoiceFormInfo;
  if (customer && (cashPayment || onlinePayment) && date) {
    await addSalesReportData(
      selectedProducts,
      invoiceFormInfo,
      products,
      addSalesReport,
      showToast,
      user
    );
    const currentDate = readableDate(date);
    setSalesReportCache((prevMap) => {
      const currentMap = new Map(prevMap);
      if (currentMap.has(currentDate)) {
        currentMap.delete(currentDate);
      }
      return currentMap;
    });
    setStockSoldCache((prevMap) => {
      const currentMap = new Map(prevMap);
      if (currentMap.has(currentDate)) {
        currentMap.delete(currentDate);
      }
      return currentMap;
    });
    clearSelectedProduct(setSelectedProductList);
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
