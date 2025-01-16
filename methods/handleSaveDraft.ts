import { ToastType } from "react-native-toast-message";
import {
  InvoiceDraft,
  InvoiceForm,
  SelectedProduct,
  User,
} from "../types/type";
import { addDraftData } from "./data-methods/addDraftData";

export const handleSaveDraft = async (
  draftTitle: string,
  user: User | null,
  invoiceFormInfo: InvoiceForm,
  selectedProducts: Map<string, SelectedProduct>,
  addDraft: (newDraft: InvoiceDraft) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  setIsSaveModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setDraftTitle: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (draftTitle.trim()) {
    setLoading(true);
    await addDraftData(
      user,
      draftTitle,
      invoiceFormInfo,
      selectedProducts,
      new Date(),
      addDraft,
      showToast
    );
    setLoading(false);
    setIsSaveModalVisible(false);
    setDraftTitle("");
  } else {
    showToast("error", "Please provide a title");
  }
};
