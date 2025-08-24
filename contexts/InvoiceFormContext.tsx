import InvoiceForm from "@/types/InvoiceForm";
import {
    createContext,
    Dispatch,
    SetStateAction,
    FC,
    useState,
    ReactNode,
    useContext,
} from "react";

type InvoiceFormContextType = {
    invoiceForm: InvoiceForm;
    setInvoiceForm: Dispatch<SetStateAction<InvoiceForm>>;
};

const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(
    undefined
);

export const InvoiceFormProvider: FC<{ children: ReactNode }> = ({
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
        <InvoiceFormContext.Provider value={{ invoiceForm, setInvoiceForm }}>
            {children}
        </InvoiceFormContext.Provider>
    );
};


export const useInvoiceFormContext = (): InvoiceFormContextType => {
    const context = useContext(InvoiceFormContext);
    if(!context){
        throw new Error("InvoiceFormContext must be used within InvoiceFormContextProvider");
    }
    return context;
}