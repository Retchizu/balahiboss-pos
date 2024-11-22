import { SalesReport } from "../../types/type";

export const calculateDailyStockSold = (
  date: Date,
  salesReports: SalesReport[],
  productId: string
) => {
  let total = 0;
  const resetDateHours = new Date(date);
  resetDateHours.setHours(0, 0, 0, 0);
  const salesReportsThisDate = salesReports.filter((salesReport) => {
    const salesReportDate = new Date(salesReport.invoiceForm.date!);
    salesReportDate.setHours(0, 0, 0, 0);
    return salesReportDate.getTime() === resetDateHours.getTime();
  });
  salesReportsThisDate.forEach((report) => {
    const extractedSelectedProduct = report.selectedProduct.find(
      (selectedProd) => selectedProd.id === productId
    );
    total += extractedSelectedProduct?.quantity
      ? extractedSelectedProduct.quantity
      : 0;
  });
  return total;
};
