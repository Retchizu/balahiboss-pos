import { SalesReport, SelectedProduct } from "../../types/type";

export const calculateOverallTotalPrice = (
  salesReports: SalesReport[],
  calculateTotalPrice: (
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

    total += calculateTotalPrice(
      salesReport.selectedProduct,
      parsedDiscount,
      parsedFreebies
    );
  });
  return total;
};
