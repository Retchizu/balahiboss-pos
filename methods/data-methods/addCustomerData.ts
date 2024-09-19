import { auth, db } from "../../firebaseConfig";
import { Customer } from "../../types/type";

export const addCustomerData = async (
  customerInfo: { customerName: string; customerInfo: string },
  addCustomer: (newCustomer: Customer) => void
) => {
  try {
    const user = auth.currentUser;
    if (customerInfo.customerName.trim() && user) {
      const customerRef = db
        .collection("users")
        .doc(user.uid)
        .collection("customers");
      const addedCustomer = await customerRef.add(customerInfo);

      const newCustomer: Customer = {
        id: addedCustomer.id,
        customerName: customerInfo.customerName,
        customerInfo: customerInfo.customerInfo,
      };
      addCustomer(newCustomer);
      return newCustomer;
    }
  } catch (error) {}
};
