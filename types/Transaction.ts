type Transaction = {
    id: string;
    customerId: string;
    date: string;
    deliveryFee: number;
    discount: number;
    items: {productId: string,  quantity: number}[];
    cashPayment: number;
    onlinePayment: number;
    freebies: number;
}

export default Transaction;