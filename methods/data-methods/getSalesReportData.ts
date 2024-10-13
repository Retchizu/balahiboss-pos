import { db } from "../../firebaseConfig";
import { SalesReport, User } from "../../types/type";
import { Timestamp } from "firebase/firestore";
import { convertTimestampToDate } from "../time-methods/convertTimestampToDate";
import { ToastType } from "react-native-toast-message";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export const getSalesReportData = async (
  startDate: Date,
  endDate: Date,
  setSalesReportList: (newReportList: SalesReport[]) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  try {
    setIsLoading(true);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const fetchedData: SalesReport[] = [];

    const startDateTimeStamp = Timestamp.fromDate(startDate);
    const endDateTimeStamp = Timestamp.fromDate(endDate);
    const salesReportQuery = query(
      collection(db, "users", user?.uid!, "sales"),
      orderBy("invoiceForm.date", "desc"),
      where("invoiceForm.date", ">=", startDateTimeStamp),
      where("invoiceForm.date", "<=", endDateTimeStamp)
    );

    const salesReportData = await getDocs(salesReportQuery);
    salesReportData.forEach((doc) => {
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
  } catch (error) {
    showToast(
      "error",
      "Something went wrong",
      "Cant get sales data, try again later"
    );
  }
};
