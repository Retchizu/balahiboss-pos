import { SalesReport } from "../../types/type";

export const calculateOverallDiscount = (salesReports: SalesReport[]) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    if (salesReport.invoiceForm.discount.trim()) {
      total += parseFloat(salesReport.invoiceForm.discount);
    }
  });
  return total;
};
