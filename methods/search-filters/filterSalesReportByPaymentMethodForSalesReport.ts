import { PaymentMethodFilter, SalesReport } from "../../types/type";

export const filterSalesReportByPaymentMethod = (
  salesReport: SalesReport[],
  paymentMethodFilter: PaymentMethodFilter,
  setSalesList: React.Dispatch<React.SetStateAction<SalesReport[]>>
) => {
  switch (paymentMethodFilter) {
    case "cash":
      setSalesList(
        salesReport.filter(
          (item) => parseFloat(item.invoiceForm.cashPayment) > 0
        )
      );
      break;
    case "online":
      setSalesList(
        salesReport.filter(
          (item) => parseFloat(item.invoiceForm.onlinePayment) > 0
        )
      );
      break;
    case "none":
      setSalesList(salesReport);
      break;
  }
};
