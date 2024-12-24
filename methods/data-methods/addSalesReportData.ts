import { ToastType } from "react-native-toast-message";
import { db, realTimeDb } from "../../firebaseConfig";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
  User,
} from "../../types/type";
import { addDoc, collection } from "firebase/firestore";
import { ref, set } from "firebase/database";

export const addSalesReportData = async (
  selectedProducts: SelectedProduct[],
  invoiceForm: InvoiceForm,
  products: Product[],
  addSalesReport: (newReport: SalesReport) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    const salesReportRef = await addDoc(
      collection(db, "users", user?.uid!, "sales"),
      {
        selectedProducts: selectedProducts,
        invoiceForm: invoiceForm,
      }
    );

    await Promise.all(
      selectedProducts.map(async (selectedProduct) => {
        const itemInProductList = products.find(
          (product) => product.id === selectedProduct.id
        );
        if (itemInProductList) {
          const reduceStockInProduct =
            itemInProductList.stock - selectedProduct.quantity;

          const productRef = ref(
            realTimeDb,
            `users/${user?.uid}/products/${itemInProductList.id}/stock`
          );
          await set(productRef, reduceStockInProduct);
        }
      })
    );
    const newSalesReport: SalesReport = {
      id: salesReportRef.id,
      invoiceForm: invoiceForm,
      selectedProduct: selectedProducts,
    };

    addSalesReport(newSalesReport);
    showToast("success", "Invoice added successfully");
  } catch (error) {
    showToast("error", "Error occured", `${(error as Error).message}`);
    console.log(`${(error as Error).message}`);
  }
};
