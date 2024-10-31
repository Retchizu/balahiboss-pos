import { ToastType } from "react-native-toast-message";
import { db, realTimeDb } from "../../firebaseConfig";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
  User,
} from "../../types/type";
import { doc, updateDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";

export const updateSalesReportData = async (
  salesReportId: string,
  invoiceForm: InvoiceForm,
  selectedProducts: SelectedProduct[],
  products: Product[],
  updateSalesReport: (
    reportId: String,
    attribute: Partial<SalesReport>
  ) => void,
  originalSelectedProducts: SelectedProduct[],
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    const salesReportRef = doc(db, "users", user?.uid!, "sales", salesReportId);
    await updateDoc(salesReportRef, {
      selectedProducts: selectedProducts,
      invoiceForm: invoiceForm,
    });

    updateSalesReport(salesReportId, {
      selectedProduct: selectedProducts,
      invoiceForm: invoiceForm,
    });
    //reduce the stock of added product to original products
    await Promise.all(
      selectedProducts.map(async (item) => {
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
    //return the stock of remove product to original products
    await Promise.all(
      originalSelectedProducts.map(async (item) => {
        const itemInProductList = products.find(
          (product) => product.id === item.id
        );
        if (itemInProductList) {
          const isInCurrentSelectedProducts = selectedProducts.find(
            (selectedProduct) => selectedProduct.id === itemInProductList.id
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
    showToast(
      "success",
      "Sales report updated successfully",
      "Redirecting, please wait..."
    );
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
