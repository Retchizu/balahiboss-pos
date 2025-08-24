import Customer from "@/types/Customer";


const searchCustomerByName = (customers: Customer[], query: string) => {
  const lowerQuery = query.toLowerCase();
  return customers.filter(customer =>
    customer.customerName.toLowerCase().includes(lowerQuery)
  );
};

export default searchCustomerByName;
