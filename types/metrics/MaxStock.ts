type MaxStock = {
    productId: string;
    productName: string | null;
    stock: number | null;
    unitsSold: number;
    windowDays: number;
    avgDailyUnits: number;
    targetCoverDays: number;
    maxStockLevel: number;
    suggestedOrderQty: number;
};

export default MaxStock;


