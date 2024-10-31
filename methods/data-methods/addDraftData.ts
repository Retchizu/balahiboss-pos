import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import {
  InvoiceDraft,
  InvoiceForm,
  SelectedProduct,
  User,
} from "../../types/type";
import { ToastType } from "react-native-toast-message";

export const addDraftData = async (
  user: User | null,
  draftTitle: string,
  invoiceForm: InvoiceForm,
  selectedProduct: SelectedProduct[],
  createdAt: Date,
  addDraft: (newDraft: InvoiceDraft) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (user) {
      const draftRef = await addDoc(
        collection(db, "users", user.uid, "drafts"),
        {
          draftTitle,
          invoiceForm,
          selectedProduct,
          createdAt,
        }
      );

      const newDraft: InvoiceDraft = {
        id: draftRef.id,
        draftTitle,
        invoiceForm,
        selectedProduct,
        createdAt,
      };
      showToast("success", "The invoice has been saved to drafts");
      addDraft(newDraft);
    }
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
