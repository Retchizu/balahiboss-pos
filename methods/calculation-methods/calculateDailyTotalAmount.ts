import { SalesReport } from "../../types/type";
import { calculateTotalPrice } from "./calculateTotalPrice";

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
    total += calculateTotalPrice(
      transaction.selectedProduct,
      undefined,
      parseFloat(transaction.invoiceForm.discount)
    );
  });
  return total;
};
