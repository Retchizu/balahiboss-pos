import Product from "@/types/Product";

type SelectedProduct = Product & {
    quantity: number;
};

export default SelectedProduct;
