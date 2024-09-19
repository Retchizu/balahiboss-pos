import { auth, db } from "../../firebaseConfig";
import {
  InvoiceForm,
  Product,
  SalesReport,
  SelectedProduct,
} from "../../types/type";

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
  originalSelectedProducts: SelectedProduct[]
) => {
  try {
    const user = auth.currentUser;
    await db
      .collection("users")
      .doc(user?.uid)
      .collection("sales")
      .doc(salesReportId)
      .update({
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
            const productRef = db
              .collection("users")
              .doc(user?.uid)
              .collection("products")
              .doc(itemInProductList.id);
            await productRef.update({
              stock: itemInProductList.stock,
            });
            updateProduct(itemInProductList.id, {
              stock: itemInProductList.stock,
            });
          }
        }
      })
    );
    console.log("Sales report updated successfully");
  } catch (error) {
    //display error
  }
};
