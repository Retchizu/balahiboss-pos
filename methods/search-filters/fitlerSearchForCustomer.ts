import { useMemo } from "react";
import { Customer } from "../../types/type";

export const filterSearchForCustomer = (
  customers: Customer[],
  searchQuery: string
) => {
  const result = useMemo(() => {
    const filteredItems = customers.filter((item) =>
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.customerName.toString().localeCompare(b.customerName.toString())
    );

    return sortedFilteredItems;
  }, [customers, searchQuery]);

  return result;
};
