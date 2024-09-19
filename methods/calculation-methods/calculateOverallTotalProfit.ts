import { SalesReport, SelectedProduct } from "../../types/type";

export const calculateOverallTotalProfit = (
  salesReports: SalesReport[],
  calculateTotalProfit: (
    selectedProducts: SelectedProduct[],
    discount?: number,
    freebies?: number
  ) => number
) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    total += calculateTotalProfit(salesReport.selectedProduct);
  });
  return total;
};
