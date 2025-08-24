import Transaction from "./Transaction"

export type PendingOrderStatus = "pending" | "packed" | "complete"

type PendingOrder = {
    id: string;
    transaction: Transaction;
    orderInformation: string;
    date: string;
    status: PendingOrderStatus;
    checkedBy: string[];
}

export default PendingOrder;


// isChecked?: boolean;