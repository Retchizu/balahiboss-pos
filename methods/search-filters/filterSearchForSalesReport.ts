import { useMemo } from "react";
import { SalesReport } from "../../types/type";

export const filterSearchForSalesReport = (
  SalesReport: SalesReport[],
  searchQuery: string,
  isNameFilter: boolean
) => {
  const result = useMemo(() => {
    const filteredItems = isNameFilter
      ? SalesReport.filter((item) =>
          item.invoiceForm.customer?.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : SalesReport.filter((item) => {
          const isProductMatch = item.selectedProduct.some((product) =>
            product.productName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
          return isProductMatch;
        });
    const sortedFilteredItems = filteredItems.sort((a, b) => {
      const dateA = a.invoiceForm.date?.getTime();
      const dateB = b.invoiceForm.date?.getTime();
      return dateB! - dateA!;
    });

    return sortedFilteredItems;
  }, [SalesReport, searchQuery]);

  return result;
};
