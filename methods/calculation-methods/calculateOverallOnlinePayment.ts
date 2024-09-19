import { SalesReport } from "../../types/type";

export const calculateOverallOnlinePayment = (salesReports: SalesReport[]) => {
  let total = 0;
  salesReports.forEach((salesReport) => {
    if (salesReport.invoiceForm.onlinePayment.trim())
      total += parseFloat(salesReport.invoiceForm.onlinePayment);
  });
  return total;
};
