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
  selectedProducts: SelectedProduct[],
  addDraft: (newDraft: InvoiceDraft) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  setIsSaveModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setDraftTitle: React.Dispatch<React.SetStateAction<string>>
) => {
  if (draftTitle.trim()) {
    const { cashPayment, onlinePayment, customer, date } = invoiceFormInfo;
    if (
      (cashPayment || onlinePayment) &&
      customer &&
      date &&
      selectedProducts.length
    ) {
      addDraftData(
        user,
        draftTitle,
        invoiceFormInfo,
        selectedProducts,
        new Date(),
        addDraft,
        showToast
      );
      setIsSaveModalVisible(false);
      setDraftTitle("");
    } else {
      showToast("error", "Please complete the invoice form");
    }
  } else {
    showToast("error", "Please provide a title");
  }
};
