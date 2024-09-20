import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig";
import { ToastType } from "react-native-toast-message";

export const signIn = async (
  userCredential: { email: string; password: string },
  navigation: any,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (!userCredential.email.trim() || !userCredential.password.trim()) {
      showToast("error", "Incomplete Field", "Provide email and passwsord");
      return;
    }
    const signInResult = await auth.signInWithEmailAndPassword(
      userCredential.email,
      userCredential.password
    );

    const user = signInResult.user;

    if (user?.emailVerified) {
      AsyncStorage.setItem("email", userCredential.email);
      AsyncStorage.setItem("password", userCredential.password);

      navigation.replace("DrawerScreen");
    }
    showToast("success", "Signed In Successfully");
    //handle email verification later
  } catch (error) {
    showToast("error", "Error Occured", "Wrong credentials or No internet");
  }
};
