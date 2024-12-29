import { ToastType } from "react-native-toast-message";
import { db, realTimeDb } from "../../firebaseConfig";
import {
  CustomerReportParams,
  InvoiceForm,
  Product,
  SalesReport,
  SalesReportDataToExcel,
  SelectedProduct,
  StockReportDataToExcel,
  User,
} from "../../types/type";
import { doc, updateDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { readableDate } from "../time-methods/readableDate";

export const updateSalesReportData = async (
  salesReportId: string,
  invoiceForm: InvoiceForm,
  selectedProducts: Map<string, SelectedProduct>,
  products: Product[],
  updateSalesReport: (
    reportId: String,
    attribute: Partial<SalesReport>
  ) => void,
  originalSelectedProducts: Map<string, SelectedProduct>,
  updateCurrentSalesReport: (
    attribute: Partial<
      CustomerReportParams & {
        fromSales: boolean;
      }
    >
  ) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null,
  setSalesReportCache: React.Dispatch<
    React.SetStateAction<Map<string, SalesReportDataToExcel[]>>
  >,
  setStockSoldCache: React.Dispatch<
    React.SetStateAction<Map<string, StockReportDataToExcel[]>>
  >
) => {
  try {
    console.log("originalSelectedProducts", originalSelectedProducts);
    console.log("selectedProducts", selectedProducts);
    const salesReportRef = doc(db, "users", user?.uid!, "sales", salesReportId);
    await updateDoc(salesReportRef, {
      selectedProducts: Array.from(selectedProducts.values()),
      invoiceForm: invoiceForm,
    });

    updateSalesReport(salesReportId, {
      selectedProduct: selectedProducts,
      invoiceForm: invoiceForm,
    });
    //reduce the stock of added product to original products
    await Promise.all(
      Array.from(selectedProducts.values()).map(async (item) => {
        const itemInProductList = products.find(
          (product) => product.id === item.id
        );
        if (itemInProductList) {
          const reduceStockInProduct = itemInProductList.stock - item.quantity;
          const productRef = ref(
            realTimeDb,
            `users/${user?.uid}/products/${itemInProductList.id}/stock`
          );
          await set(productRef, reduceStockInProduct);
        }
      })
    );

    // Return the stock of removed products to original products
    await Promise.all(
      Array.from(originalSelectedProducts.values()).map(async (item) => {
        const itemInProductList = products.find(
          (product) => product.id === item.id
        );
        if (itemInProductList) {
          const isInCurrentSelectedProducts = selectedProducts.has(
            itemInProductList.id
          );
          if (!isInCurrentSelectedProducts) {
            const productRef = ref(
              realTimeDb,
              `users/${user?.uid}/products/${itemInProductList.id}/stock`
            );
            await set(productRef, itemInProductList.stock);
          }
        }
      })
    );

    const currentDate = readableDate(invoiceForm.date!);
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

    updateCurrentSalesReport({
      id: salesReportId,
      cashPayment: invoiceForm.cashPayment,
      onlinePayment: invoiceForm.onlinePayment,
      customer: invoiceForm.customer,
      date: invoiceForm.date?.toISOString(),
      discount: invoiceForm.discount,
      freebies: invoiceForm.freebies,
      deliveryFee: invoiceForm.deliveryFee,
      selectedProducts: selectedProducts,
      fromSales: true,
    });
    showToast("success", "Sales report updated successfully");
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
    console.log(error);
  }
};
