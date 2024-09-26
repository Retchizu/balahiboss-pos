import { auth, db } from "../../firebaseConfig";
import { SalesReport } from "../../types/type";
import firebase from "firebase/compat/app";
import { convertTimestampToDate } from "../time-methods/convertTimestampToDate";
import { ToastType } from "react-native-toast-message";

export const getSalesReportData = async (
  startDate: Date,
  endDate: Date,
  setSalesReportList: (newReportList: SalesReport[]) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    setIsLoading(true);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const user = auth.currentUser;
    const fetchedData: SalesReport[] = [];
    const startDateTimeStamp = firebase.firestore.Timestamp.fromDate(startDate);
    const endDateTimeStamp = firebase.firestore.Timestamp.fromDate(endDate);
    const salesReportRef = db
      .collection("users")
      .doc(user?.uid)
      .collection("sales")
      .where("invoiceForm.date", ">=", startDateTimeStamp)
      .where("invoiceForm.date", "<=", endDateTimeStamp)
      .orderBy("invoiceForm.date", "desc");

    const salesReportSnapshot = await salesReportRef.get();
    salesReportSnapshot.forEach((doc) => {
      const { invoiceForm, selectedProducts } = doc.data();
      const salesReportData: SalesReport = {
        id: doc.id,
        invoiceForm: {
          ...invoiceForm,
          date: convertTimestampToDate(invoiceForm.date),
        },
        selectedProduct: selectedProducts,
      };

      fetchedData.push(salesReportData);
    });
    setSalesReportList(fetchedData);
    setIsLoading(false);
    console.log("fetched");
  } catch (error) {
    showToast(
      "error",
      "Something went wrong",
      "Cant get sales data, try again later"
    );
  }
};
