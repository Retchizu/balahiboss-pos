import { SalesReport } from "../types/type";

export const handleInvoiceInputChange = (
  label: string,
  value: string,
  setCustomerSalesReport: (value: React.SetStateAction<SalesReport>) => void
) => {
  setCustomerSalesReport((prev) => ({
    ...prev,
    invoiceForm: {
      ...prev.invoiceForm,
      [label]: value,
    },
  }));
};
