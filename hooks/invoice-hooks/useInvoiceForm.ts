import { useEffect } from "react";
import { useInvoiceContext } from "../../context/InvoiceContext";

export const useInvoiceForm = (params: any) => {
  const { invoiceForm, setInvoiceForm } = useInvoiceContext();

  useEffect(() => {
    if (params) {
      setInvoiceForm((prev) => ({
        ...prev,
        customer: params,
      }));
    }
  }, [params]);

  const resetForm = () => {
    setInvoiceForm({
      cashPayment: "",
      onlinePayment: "",
      customer: null,
      date: null,
      discount: "",
      freebies: "",
      deliveryFee: "",
    });
  };

  return {
    invoiceForm,
    setInvoiceForm,
    resetForm,
  };
};
