import { SalesReport } from "../../types/type";
import { calculateTotalPrice } from "./calculateTotalPrice";

export const calculateDailyTotalAmount = (
  date: Date,
  salesReports: SalesReport[]
) => {
  const resetDateHours = new Date(date);
  resetDateHours.setHours(0, 0, 0, 0);
  const salesReportThisDate = salesReports.find((report) => {
    const salesReportDate = new Date(report.invoiceForm.date!);
    salesReportDate.setHours(0, 0, 0, 0);
    return salesReportDate.getTime() === resetDateHours.getTime();
  });

  return salesReportThisDate
    ? calculateTotalPrice(
        salesReportThisDate.selectedProduct,
        undefined,
        parseFloat(salesReportThisDate.invoiceForm.discount)
      )
    : 0;
};
