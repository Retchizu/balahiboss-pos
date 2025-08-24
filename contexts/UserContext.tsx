
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from "react";

type UserContextType = {
    role: string;
    setRole: Dispatch<SetStateAction<string>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FC<{children:ReactNode}> = ({children}) => {
    const [role, setRole] = useState("");


    return (
        <UserContext.Provider value={{role, setRole}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = (): UserContextType  => {
    const context = useContext(UserContext);
    if(!context){
        throw new Error("UserContext must be used within UserProvider");
    }
    return context;
}

