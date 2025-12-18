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
    setRecentTransactions: Dispatch<SetStateAction<Transaction[]>>;
};

const RecentTransactionContext = createContext<RecentContextType | undefined>(
    undefined
);

export const RecentTransactionProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
        []
    );

    return (
        <RecentTransactionContext.Provider
            value={{ recentTransactions, setRecentTransactions }}
        >
            {children}
        </RecentTransactionContext.Provider>
    );
};


export  const useRecentTransactionContext = (): RecentContextType => {
    const context = useContext(RecentTransactionContext);
    if(!context){
        throw new Error("RecentTransactionContext must be used within RecentTransactionProvider");
    }
    return context;
}