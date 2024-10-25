import { useState, useEffect } from "react";
import { InvoiceForm } from "../../types/type";

export const useInvoiceForm = (params: any) => {
  const [invoiceFormInfo, setInvoiceFormInfo] = useState<InvoiceForm>({
    cashPayment: "",
    onlinePayment: "",
    customer: null,
    date: null,
    discount: "",
    freebies: "",
    deliveryFee: "",
  });

  useEffect(() => {
    if (params) {
      setInvoiceFormInfo((prev) => ({
        ...prev,
        customer: params,
      }));
    }
  }, [params]);

  const resetForm = () => {
    setInvoiceFormInfo({
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
    invoiceFormInfo,
    setInvoiceFormInfo,
    resetForm,
  };
};
