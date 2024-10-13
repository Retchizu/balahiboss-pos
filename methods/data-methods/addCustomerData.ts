import { ToastType } from "react-native-toast-message";
import { db } from "../../firebaseConfig";
import { Customer, User } from "../../types/type";
import { addDoc, collection } from "firebase/firestore";

export const addCustomerData = async (
  customerInfo: { customerName: string; customerInfo: string },
  addCustomer: (newCustomer: Customer) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    if (customerInfo.customerName.trim() && user) {
      const customerRef = await addDoc(
        collection(db, "users", user?.uid!, "customers"),
        customerInfo
      );

      const newCustomer: Customer = {
        id: customerRef.id,
        customerName: customerInfo.customerName,
        customerInfo: customerInfo.customerInfo,
      };
      addCustomer(newCustomer);
      showToast(
        "success",
        "Customer added",
        `Successfully added product "${customerInfo.customerName}"`
      );
      return newCustomer;
    } else {
      showToast("error", "Customer name required");
    }
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
