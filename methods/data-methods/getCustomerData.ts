import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Customer, User } from "../../types/type";

export const getCustomerData = async (
  setCustomerList: (newCustomerList: Customer[]) => void,
  user: User | null
) => {
  try {
    if (user) {
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
  } catch (error) {}
};
