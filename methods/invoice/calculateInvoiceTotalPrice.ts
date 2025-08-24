import InvoiceForm from "@/types/InvoiceForm";
import SelectedProduct from "@/types/SelectedProduct";

const calculateInvoiceTotalPrice = (
    invoiceForm: InvoiceForm,
    selectedProducts: SelectedProduct[]
): number => {
    const productTotal = selectedProducts.reduce((total, product) => {
        return total + (product.sellPrice) * (product.quantity);
    }, 0);

    const discount = parseFloat(invoiceForm.discount || "0");
    const deliveryFee = parseFloat(invoiceForm.deliveryFee || "0");

    return productTotal - discount + deliveryFee;
};

export default calculateInvoiceTotalPrice;