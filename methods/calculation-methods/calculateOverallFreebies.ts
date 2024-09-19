import { SalesReport } from "../../types/type";

export const calculateOverallFreebies = (salesReports: SalesReport[]) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    if (salesReport.invoiceForm.freebies.trim()) {
      total += parseFloat(salesReport.invoiceForm.freebies);
    }
  });
  return total;
};
