import InvoiceForm from "@/types/InvoiceForm";
import SelectedProduct from "@/types/SelectedProduct";

const calculateTotalProfit = (
    selectedProducts: SelectedProduct[],
    invoiceForm: InvoiceForm
) => {
    const { freebies, discount } = invoiceForm;

    const grossProfit = selectedProducts.reduce((acc, product) => {
        const unitProfit = product.sellPrice - product.stockPrice;
        return acc + unitProfit * product.quantity;
    }, 0);

    return grossProfit - parseFloat(freebies || "0") - parseFloat(discount || "0");
};

export default calculateTotalProfit;
