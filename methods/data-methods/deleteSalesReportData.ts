import { auth, db } from "../../firebaseConfig";
import { Product, SalesReport } from "../../types/type";

export const deleteSalesReportData = async (
  salesReportId: string,
  salesReports: SalesReport[],
  setSalesReportList: (newSalesReportList: SalesReport[]) => void,
  products: Product[],
  updateProduct: (productId: String, attribute: Partial<Product>) => void
) => {
  try {
    const user = auth.currentUser;
    await db
      .collection("users")
      .doc(user?.uid)
      .collection("sales")
      .doc(salesReportId)
      .delete();

    const currentSalesReport = salesReports.find(
      (salesReport) => salesReport.id === salesReportId
    );
    const updatedData = salesReports.filter(
      (element) => element.id !== salesReportId
    );

    currentSalesReport?.selectedProduct.map((selectedProduct) => {
      const productInList = products.find(
        (product) => product.id === selectedProduct.id
      );
      if (productInList) {
        const retrievedProductStock =
          productInList.stock + selectedProduct.quantity;
        updateProduct(productInList.id, {
          stock: retrievedProductStock,
        });

        db.collection("users")
          .doc(user?.uid)
          .collection("products")
          .doc(productInList.id)
          .update({
            stock: retrievedProductStock,
          });
      }
      setSalesReportList(updatedData);
      console.log("Deleted Successfully");
    });
  } catch (error) {
    //display error
  }
};
