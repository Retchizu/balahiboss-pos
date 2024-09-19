import { useMemo } from "react";
import { SalesReport } from "../../types/type";

export const filterSearchForSalesReport = (
  SalesReport: SalesReport[],
  searchQuery: string
) => {
  const result = useMemo(() => {
    const filteredItems = SalesReport.filter((item) =>
      item.invoiceForm.customer?.customerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.invoiceForm.customer!.customerName!.localeCompare(
        b.invoiceForm.customer!.customerName!
      )
    );

    return sortedFilteredItems;
  }, [SalesReport, searchQuery]);

  return result;
};
