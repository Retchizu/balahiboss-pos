import PendingOrder from "@/types/PendingOrder";
import { useMemo } from "react";

const usePendingOrdersArray = (
  pendingOrders: Record<string, PendingOrder>
) => {
  const pendingOrdersArray = useMemo(() => {
    if (!pendingOrders) return [];

    return Object.entries(pendingOrders)
      .map(([id, order]) => ({
        ...order,
        id
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pendingOrders]);

  return {pendingOrdersArray};
};

export default usePendingOrdersArray;