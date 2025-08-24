import SelectedProduct from "@/types/SelectedProduct";

const calculateSubTotalPrice = (selectedProduct: SelectedProduct) => {
    return selectedProduct.sellPrice * selectedProduct.quantity
}

export default calculateSubTotalPrice;