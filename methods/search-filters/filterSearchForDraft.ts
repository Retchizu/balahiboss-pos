import { useMemo } from "react";
import { InvoiceDraft } from "../../types/type";

export const filterSearchForDraft = (
  drafts: InvoiceDraft[],
  searchQuery: string
) => {
  const result = useMemo(() => {
    const filteredItems = drafts.filter((item) =>
      item.draftTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.draftTitle.toString().localeCompare(b.draftTitle.toString())
    );

    return sortedFilteredItems;
  }, [drafts, searchQuery]);

  return result;
};
