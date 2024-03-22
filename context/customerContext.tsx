import { createContext, useContext, useState, ReactNode } from "react";
import { Customer } from "../type";

type CustomerContextType = {
  customers: Customer[];
  addCustomer: (newCustomer: Customer) => void;
  updateCustomer: (customerId: String, attribute: Partial<Customer>) => void;
  setCustomerList: (newCustomerList: Customer[]) => void;
};

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const addCustomer = (newCustomer: Customer) => {
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
  };
  const updateCustomer = (customerId: String, attribute: Partial<Customer>) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === customerId ? { ...customer, ...attribute } : customer
      )
    );
  };
  const setCustomerList = (newCustomerList: Customer[]) => {
    setCustomers(newCustomerList);
  };
  return (
    <CustomerContext.Provider
      value={{ customers, addCustomer, updateCustomer, setCustomerList }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerContext = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
