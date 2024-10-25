import { useMemo } from "react";
import { SalesReport } from "../types/type";

export const useRecentSalesReportManager = (
  startDate: Date,
  endDate: Date,
  salesReports: SalesReport[]
) => {
  const filterData = useMemo(() => {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 59);

    return salesReports.filter(
      (salesReport) =>
        salesReport.invoiceForm.date! >= startDate &&
        salesReport.invoiceForm.date! <= endDate
    );
  }, [salesReports]);

  const sortedData = useMemo(() => {
    return filterData.sort((a, b) => {
      return (
        new Date(b.invoiceForm.date!).getTime() -
        new Date(a.invoiceForm.date!).getTime()
      );
    });
  }, [filterData]);

  return sortedData;
};
