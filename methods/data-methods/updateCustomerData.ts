import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { Customer, User } from "../../types/type";
import { doc, updateDoc } from "firebase/firestore";

export const updateCustomerData = async (
  customerId: String,
  customerInfo: { customerName: string; customerInfo: string },
  updateCustomer: (customerId: String, attribute: Partial<Customer>) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    if (user) {
      const customerRef = doc(
        db,
        "users",
        user?.uid!,
        "customers",
        customerId.toString()
      );
      await updateDoc(customerRef, {
        customerName: customerInfo.customerName,
        customerInfo: customerInfo.customerInfo,
      });
      updateCustomer(customerId, {
        customerName: customerInfo.customerName,
        customerInfo: customerInfo.customerInfo,
      });
    }
    showToast("success", "Customer updated successfully");
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
