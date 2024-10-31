import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { InvoiceDraft, User } from "../../types/type";
import { ToastType } from "react-native-toast-message";

export const deleteDraftData = async (
  user: User | null,
  draftId: string,
  drafts: InvoiceDraft[],
  setDraftList: (newDraftList: InvoiceDraft[]) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    const draftRef = doc(db, "users", user?.uid!, "drafts", draftId);
    await deleteDoc(draftRef);

    const updatedData = drafts.filter((draft) => draft.id !== draftId);
    showToast("success", "Draft deleted successfully");
    setDraftList(updatedData);
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};

export const deleteMultipleDraftData = async (
  user: User | null,
  drafts: InvoiceDraft[],
  setDraftList: (newDraftList: InvoiceDraft[]) => void,
  draftsToDelete: InvoiceDraft[],
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    await Promise.all(
      draftsToDelete.map(async (draft) => {
        const draftRef = doc(db, "users", user?.uid!, "drafts", draft.id);
        await deleteDoc(draftRef);
      })
    );

    const draftsToDeleteId = new Set(draftsToDelete.map((draft) => draft.id));
    const updatedData = drafts.filter(
      (draft) => !draftsToDeleteId.has(draft.id)
    );
    setDraftList(updatedData);
    showToast("success", "Drafts deleted successfully");
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
