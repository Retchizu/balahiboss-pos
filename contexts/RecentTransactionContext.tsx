import Transaction from "@/types/Transaction";
import {
    createContext,
    Dispatch,
    SetStateAction,
    FC,
    ReactNode,
    useState,
    useContext,
} from "react";

type RecentContextType = {
    recentTransactions: Transaction[];
    setRecentTranscations: Dispatch<SetStateAction<Transaction[]>>;
};

const RecentTransactionContext = createContext<RecentContextType | undefined>(
    undefined
);

export const RecentTransactionProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [recentTransactions, setRecentTranscations] = useState<Transaction[]>(
        []
    );

    return (
        <RecentTransactionContext.Provider
            value={{ recentTransactions, setRecentTranscations }}
        >
            {children}
        </RecentTransactionContext.Provider>
    );
};


export  const useRecentTrasactionContext = (): RecentContextType => {
    const context = useContext(RecentTransactionContext);
    if(!context){
        throw new Error("RecentTransactionContext must be used within RecentTransactionProvider");
    }
    return context;
}