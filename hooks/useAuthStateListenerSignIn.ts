import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useToastContext } from "../context/ToastContext";
import { User } from "../types/type";

export const useAuthStateListenerSignIn = (
  navigation: any,
  signUser: (user: User | null) => void
) => {
  const { showToast } = useToastContext(); // Access toast context for notifications

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
        showToast("success", "Signed In Successfully");
      }
    });
    return () => unsubscribe();
  }, []);
};
