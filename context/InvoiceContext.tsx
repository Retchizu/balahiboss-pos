import { createContext, ReactNode, useContext, useState } from "react";
import { InvoiceForm } from "../types/type";

type InvoiceContextType = {
  invoiceForm: InvoiceForm;
  setInvoiceForm: React.Dispatch<React.SetStateAction<InvoiceForm>>;
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>({
    cashPayment: "",
    onlinePayment: "",
    customer: null,
    date: null,
    discount: "",
    freebies: "",
    deliveryFee: "",
  });
  return (
    <InvoiceContext.Provider value={{ invoiceForm, setInvoiceForm }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoiceContext must be used within InvoiceProvider");
  }
  return context;
};
