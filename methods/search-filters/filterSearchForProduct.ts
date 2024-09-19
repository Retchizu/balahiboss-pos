import { useMemo } from "react";
import { Product } from "../../types/type";

export const filterSearchForPoduct = (
  products: Product[],
  searchQuery: string
) => {
  const result = useMemo(() => {
    const filteredItems = products.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [products, searchQuery]);

  return result;
};
