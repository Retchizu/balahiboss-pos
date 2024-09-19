import { auth, db } from "../../firebaseConfig";
import { Customer } from "../../types/type";

export const getCustomerData = async (
  setCustomerList: (newCustomerList: Customer[]) => void
) => {
  const user = auth.currentUser;
  try {
    if (user) {
      const fetched: Customer[] = [];
      const customerRef = db
        .collection("users")
        .doc(user.uid)
        .collection("customers");
      const querySnapshot = await customerRef.get();
      querySnapshot.forEach((doc) => {
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
