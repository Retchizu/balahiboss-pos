import { deleteDoc, doc } from "firebase/firestore";
import { db, realTimeDb } from "../../firebaseConfig";
import { Product, SalesReport, User } from "../../types/type";
import { ToastType } from "react-native-toast-message";
import { ref, set } from "firebase/database";

export const deleteSalesReportData = async (
  salesReportId: string,
  salesReports: SalesReport[],
  setSalesReportList: (newSalesReportList: SalesReport[]) => void,
  products: Product[],
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    const salesReportRef = doc(db, "users", user?.uid!, "sales", salesReportId);
    await deleteDoc(salesReportRef);

    const currentSalesReport = salesReports.find(
      (salesReport) => salesReport.id === salesReportId
    );
    const updatedData = salesReports.filter(
      (element) => element.id !== salesReportId
    );

    const salesReportPromises = Array.from(
      currentSalesReport!.selectedProduct.values()
    ).map(async (selectedProduct) => {
      const productInList = products.find(
        (product) => product.id === selectedProduct.id
      );
      if (productInList) {
        const retrievedProductStock =
          productInList.stock + selectedProduct.quantity;
        /*  updateProduct(productInList.id, {
            stock: retrievedProductStock,
          }); */

        /*  const productRef = doc(
            db,
            "users",
            user?.uid!,
            "products",
            productInList.id
          ); */
        const productRef = ref(
          realTimeDb,
          `users/${user?.uid}/products/${selectedProduct.id}/stock`
        );
        await set(productRef, retrievedProductStock);
        /*  await updateDoc(productRef, {
            stock: retrievedProductStock,
          }); */
      }
      setSalesReportList(updatedData);
      showToast("success", "Invoice deleted sucessfully");
    });

    await Promise.all(salesReportPromises || []);
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
