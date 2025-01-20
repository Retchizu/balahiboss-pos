import { SalesReport, SelectedProduct } from "../../types/type";

export const calculateOverallTotalPrice = (
  salesReports: SalesReport[],
  calculateTotalPriceForSummary: (
    selectedProducts: Map<string, SelectedProduct>,
    deliveryFee?: number,
    freebies?: number
  ) => number
) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    const parsedFreebies = isNaN(parseFloat(salesReport.invoiceForm.freebies))
      ? 0
      : parseFloat(salesReport.invoiceForm.freebies);

    const parsedDiscount = isNaN(parseFloat(salesReport.invoiceForm.discount))
      ? 0
      : parseFloat(salesReport.invoiceForm.discount);

    total += calculateTotalPriceForSummary(
      salesReport.selectedProduct,
      parsedDiscount,
      parsedFreebies
    );
  });
  return total;
};
