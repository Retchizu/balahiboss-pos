import { SalesReportSearchBarFilter } from "../../types/type";

export const chooseFilterTypeForSaleslist = (
  key: number,
  setSalesReportSearchBarFilter: React.Dispatch<
    React.SetStateAction<SalesReportSearchBarFilter>
  >
) => {
  switch (key) {
    case 1:
      setSalesReportSearchBarFilter("customer_name");
      break;
    case 2:
      setSalesReportSearchBarFilter("product_name");
      break;
  }
};

export const choices = [
  { key: 1, choiceName: "Customer name" },
  { key: 2, choiceName: "Product name" },
];
