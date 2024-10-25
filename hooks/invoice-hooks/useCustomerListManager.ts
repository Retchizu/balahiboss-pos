import { useState } from "react";
import { Customer } from "../../types/type";
import { filterSearchForCustomer } from "../../methods/search-filters/fitlerSearchForCustomer";

export const useCustomerListManager = (customers: Customer[]) => {
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isLoadingCustomerFetch, setIsLoadingCustomerFetch] = useState(false);

  const filteredCustomerData = filterSearchForCustomer(
    customers,
    customerSearchQuery
  );

  return {
    isCustomerListVisible,
    setIsCustomerListVisible,
    customerSearchQuery,
    setCustomerSearchQuery,
    filteredCustomerData,
    isLoadingCustomerFetch,
    setIsLoadingCustomerFetch,
  };
};
