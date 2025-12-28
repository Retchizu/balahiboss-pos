type Product = {
    id: string;
    productName: string;
    stockPrice: number;
    sellPrice: number;
    stock: number;
    imageUrl: string;
    deleted: boolean;
    categoryIds?: string[]
}

export default Product;