import { ToastType } from "react-native-toast-message";
import { auth, db } from "../../firebaseConfig";
import { Customer } from "../../types/type";

export const updateCustomerData = async (
  customerId: String,
  customerInfo: { customerName: string; customerInfo: string },
  updateCustomer: (customerId: String, attribute: Partial<Customer>) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const docRef = db
        .collection("users")
        .doc(user.uid)
        .collection("customers")
        .doc(customerId.toString());
      await docRef.update({
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
