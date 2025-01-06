import { useMemo } from "react";
import { SalesReport, SalesReportSearchBarFilter } from "../../types/type";

export const filterSearchForSalesReport = (
  salesReport: SalesReport[],
  searchQuery: string,
  salesReportSearchBarFilter: SalesReportSearchBarFilter
) => {
  const result = useMemo(() => {
    const filteredItems =
      salesReportSearchBarFilter === "customer_name"
        ? salesReport.filter((item) =>
            item.invoiceForm.customer?.customerName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : salesReport.filter((item) => {
            let isProductMatch = false;
            item.selectedProduct.forEach((product) => {
              if (
                product.productName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ) {
                isProductMatch = true;
              }
            });
            return isProductMatch;
          });
    const sortedFilteredItems = filteredItems.sort((a, b) => {
      const dateA = a.invoiceForm.date?.getTime();
      const dateB = b.invoiceForm.date?.getTime();
      return dateB! - dateA!;
    });

    return sortedFilteredItems;
  }, [salesReport, searchQuery]);

  return result;
};
