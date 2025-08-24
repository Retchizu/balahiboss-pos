import Customer from "@/types/Customer";
import { useMemo } from "react";

const useCustomersArray = (customers?: Record<string, Customer>) => {
  const customerArray = useMemo(() => {
    if (!customers || Object.keys(customers).length === 0) {
      return [];
    }

    return Object.entries(customers)
      .map(([id, customer]) => ({
        ...customer,
        id,
      }))
      .sort((a, b) => a.customerName.localeCompare(b.customerName));
  }, [customers]);

  return { customerArray };
};
export default useCustomersArray;
