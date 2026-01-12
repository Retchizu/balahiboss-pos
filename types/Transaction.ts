type Transaction = {
    id: string;
    customerId: string;
    date: string;
    deliveryFee: number;
    discount: number;
    items: TransactionItem[];
    cashPayment: number;
    onlinePayment: number;
    freebies: number;
}

export default Transaction;


export type TransactionItem = {
    productId: string;
    productName: string;
    sellPrice: number;
    stockPrice: number;
    quantity: number;
}
