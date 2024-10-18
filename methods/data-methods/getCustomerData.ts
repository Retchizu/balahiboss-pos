import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Customer, User } from "../../types/type";
import { ToastType } from "react-native-toast-message";

export const getCustomerData = async (
  setCustomerList: (newCustomerList: Customer[]) => void,
  user: User | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (user) {
      setIsLoading(true);
      const fetched: Customer[] = [];
      const customerData = await getDocs(
        collection(db, "users", user.uid, "customers")
      );
      customerData.forEach((doc) => {
        const { customerName, customerInfo } = doc.data();
        fetched.push({
          id: doc.id,
          customerName,
          customerInfo,
        });
      });
      setCustomerList(fetched);
    }
  } catch (error) {
    showToast("error", "Something went wrong", "Try again later");
  } finally {
    setIsLoading(false);
  }
};
