import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { Customer, User } from "../../types/type";
import { deleteDoc, doc } from "firebase/firestore";

export const deleteCustomerData = async (
  customerId: String,
  customers: Customer[],
  setCustomerList: (newCustomerList: Customer[]) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    if (user) {
      const customerRef = doc(
        db,
        "users",
        user.uid,
        "customers",
        customerId.toString()
      );
      await deleteDoc(customerRef);

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
