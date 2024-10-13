import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
  User,
} from "../../types/type";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

export const addSalesReportData = async (
  selectedProducts: SelectedProduct[],
  invoiceForm: InvoiceForm,
  products: Product[],
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
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
      selectedProducts.map(async (item) => {
        const itemInProductList = products.find(
          (product) => product.id === item.id
        );
        if (itemInProductList) {
          const reduceStockInProduct = itemInProductList.stock - item.quantity;
          const productRef = doc(
            db,
            "users",
            user?.uid!,
            "products",
            itemInProductList.id
          );

          await updateDoc(productRef, {
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
