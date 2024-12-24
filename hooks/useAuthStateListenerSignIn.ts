import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { User } from "../types/type";

export const useAuthStateListenerSignIn = (
  navigation: any,
  signUser: (user: User | null) => void
) => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userInfo: User = {
          uid: user.uid!,
          email: user.email!,
          displayName: user.displayName!,
        };

        signUser(userInfo);
        navigation.replace("DrawerScreen");
      }
    });
    return () => unsubscribe();
  }, []);
};
