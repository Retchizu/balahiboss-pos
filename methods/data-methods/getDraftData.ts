import { ToastType } from "react-native-toast-message";
import { InvoiceDraft, InvoiceForm, User } from "../../types/type";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { convertTimestampToDate } from "../time-methods/convertTimestampToDate";

export const getDraftData = async (
  user: User | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setDraftlist: (newDraftList: InvoiceDraft[]) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (user) {
      setIsLoading(true);
      const fetched: InvoiceDraft[] = [];
      const invoiceDraftData = await getDocs(
        collection(db, "users", user.uid, "drafts")
      );
      invoiceDraftData.forEach((doc) => {
        const { draftTitle, invoiceForm, selectedProduct, createdAt } =
          doc.data();
        fetched.push({
          id: doc.id,
          draftTitle,
          invoiceForm: {
            ...invoiceForm,
            date: invoiceForm.date
              ? convertTimestampToDate(invoiceForm.date)
              : null,
          },
          selectedProduct,
          createdAt: convertTimestampToDate(createdAt),
        });
      });

      setDraftlist(fetched);
    }
  } catch (error) {
    showToast("error", "Something went wrong", "Try again later");
  } finally {
    setIsLoading(false);
  }
};
