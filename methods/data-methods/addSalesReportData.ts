import { ToastType } from "react-native-toast-message";
import { auth, db } from "../../firebaseConfig";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
} from "../../types/type";

export const addSalesReportData = async (
  selectedProducts: SelectedProduct[],
  invoiceForm: InvoiceForm,
  products: Product[],
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  addSalesReport: (newReport: SalesReport) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    const user = auth.currentUser;
    const salesReportRef = await db
      .collection("users")
      .doc(user?.uid)
      .collection("sales")
      .add({
        selectedProducts: selectedProducts,
        invoiceForm: invoiceForm,
      });
    await Promise.all(
      selectedProducts.map(async (item) => {
        const itemInProductList = products.find(
          (product) => product.id === item.id
        );
        if (itemInProductList) {
          const reduceStockInProduct = itemInProductList.stock - item.quantity;
          const productRef = db
            .collection("users")
            .doc(user?.uid)
            .collection("products")
            .doc(itemInProductList.id);

          await productRef.update({
            stock: reduceStockInProduct,
          });

          updateProduct(itemInProductList.id, {
            stock: reduceStockInProduct,
          });
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
    return;
  } catch (error) {
    showToast("error", "Error occured", `${(error as Error).message}`);
    console.log(`${(error as Error).message}`);
  }
};
