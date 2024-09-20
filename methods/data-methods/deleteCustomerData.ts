import { ToastType } from "react-native-toast-message";
import { auth, db } from "../../firebaseConfig";
import { Customer } from "../../types/type";

export const deleteCustomerData = async (
  customerId: String,
  customers: Customer[],
  setCustomerList: (newCustomerList: Customer[]) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await db
        .collection("users")
        .doc(user.uid)
        .collection("customers")
        .doc(customerId.toString())
        .delete();

      const updatedCustomerList = customers.filter(
        (item) => item.id !== customerId
      );
      setCustomerList(updatedCustomerList);
    }
    showToast("success", "Customer deleted successfully");
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
