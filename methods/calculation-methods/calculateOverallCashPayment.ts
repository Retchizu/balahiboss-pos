import { SalesReport } from "../../types/type";

export const calculateOverallCashPayment = (salesReports: SalesReport[]) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    if (salesReport.invoiceForm.cashPayment.trim())
      total += parseFloat(salesReport.invoiceForm.cashPayment);
  });
  return total;
};
