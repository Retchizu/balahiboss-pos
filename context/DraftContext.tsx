import { createContext, ReactNode, useContext, useState } from "react";
import { InvoiceDraft } from "../types/type";

type DraftContextType = {
  drafts: InvoiceDraft[];
  addDraft: (newDraft: InvoiceDraft) => void;
  setDraftList: (newDraftList: InvoiceDraft[]) => void;
};

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [drafts, setDrafts] = useState<InvoiceDraft[]>([]);

  const addDraft = (newDraft: InvoiceDraft) => {
    setDrafts((prev) => [...prev, newDraft]);
  };

  const setDraftList = (newDraftList: InvoiceDraft[]) => {
    setDrafts(newDraftList);
  };

  return (
    <DraftContext.Provider value={{ drafts, addDraft, setDraftList }}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDraftContext = (): DraftContextType => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDraftContext must be used within DraftProvider");
  }
  return context;
};
