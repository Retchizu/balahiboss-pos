import { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../types/type";

type UserContextType = {
  user: User | null;
  signUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const signUser = (user: User | null) => {
    setUser(user);
  };

  return (
    <UserContext.Provider value={{ user, signUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
