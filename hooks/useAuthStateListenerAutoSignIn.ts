import { onAuthStateChanged } from "firebase/auth";
import { useToastContext } from "../context/ToastContext";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";
import * as SecureStore from "expo-secure-store";
import { User } from "../types/type";

export const useAuthStateListenerAutoSignIn = (
  navigation: any,
  signUser: (user: User | null) => void,
  dependencyParams: boolean
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

        SecureStore.setItem("user", JSON.stringify(userInfo));
        signUser(userInfo);
        navigation.replace("DrawerScreen");
        showToast("success", "Signed In Successfully");
      } else {
        navigation.replace("SignInScreen");
      }
    });
    return () => unsubscribe();
  }, [dependencyParams]);
};
