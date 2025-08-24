import Customer from "@/types/Customer";

type InvoiceForm = {
    cashPayment: string;
    onlinePayment: string;
    customer: Customer | null;
    date: Date | null;
    discount: string;
    freebies: string;
    deliveryFee: string;
};

export default InvoiceForm;
