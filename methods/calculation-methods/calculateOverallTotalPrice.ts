import { SalesReport, SelectedProduct } from "../../types/type";

export const calculateOverallTotalPrice = (
  salesReports: SalesReport[],
  calculateTotalPrice: (
    selectedProducts: SelectedProduct[],
    deliveryFee?: number
  ) => number
) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    total += calculateTotalPrice(salesReport.selectedProduct);
  });
  return total;
};
