import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
  User,
} from "../../types/type";
import { doc, updateDoc } from "firebase/firestore";

export const updateSalesReportData = async (
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
            const productRef = doc(
              db,
              "users",
              user?.uid!,
              "products",
              itemInProductList.id
            );
            await updateDoc(productRef, {
              stock: itemInProductList.stock,
            });
            updateProduct(itemInProductList.id, {
              stock: itemInProductList.stock,
            });
          }
        }
      })
    );
    showToast("success", "Sales report updated successfully");
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
