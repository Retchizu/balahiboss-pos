import Customer from "@/types/Customer";
import PendingOrder from "@/types/PendingOrder";

const searchOrderByCustomerName = (
  pendingOrders: PendingOrder[],
  customers: Record<string, Customer>,
  searchQuery: string
) => {
  const query = searchQuery.toLowerCase();

  return pendingOrders.filter((order) => {
    const customer = customers[order.transaction.customerId];
    if (!customer) return false;

    return customer.customerName.toLowerCase().includes(query);
  });
};

export default searchOrderByCustomerName;