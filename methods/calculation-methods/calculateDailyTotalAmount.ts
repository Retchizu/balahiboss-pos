import { SalesReport } from "../../types/type";
import { calculateTotalPriceForSummary } from "./calculateTotalPriceForSummary";

export const calculateDailyTotalAmount = (
  date: Date,
  salesReports: SalesReport[],
  customerId: string
) => {
  let total = 0;
  const resetDateHours = new Date(date);
  resetDateHours.setHours(0, 0, 0, 0);
  const customerTransactionThisDate = salesReports.filter((report) => {
    const salesReportDate = new Date(report.invoiceForm.date!);
    salesReportDate.setHours(0, 0, 0, 0);
    return (
      salesReportDate.getTime() === resetDateHours.getTime() &&
      report.invoiceForm.customer?.id === customerId
    );
  });
  customerTransactionThisDate.forEach((transaction) => {
    total += calculateTotalPriceForSummary(
      transaction.selectedProduct,
      parseFloat(transaction.invoiceForm.discount)
    );
  });
  return total;
};
