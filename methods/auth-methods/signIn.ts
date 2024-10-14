import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastType } from "react-native-toast-message";
import { User } from "../../types/type";
import { auth } from "../../firebaseConfig";

export const signIn = async (
  userCredential: { email: string; password: string },
  navigation: any,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  signUser: (user: User | null) => void,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    if (setLoading) setLoading(true);
    if (!userCredential.email.trim() || !userCredential.password.trim()) {
      showToast("error", "Incomplete Field", "Provide email and passwsord");
      return;
    }
    const signInResult = await signInWithEmailAndPassword(
      auth,
      userCredential.email,
      userCredential.password
    );

    const user: User = {
      uid: signInResult.user?.uid!,
      email: signInResult.user?.email!,
      displayName: signInResult.user?.displayName!,
    };

    if (user) {
      signUser(user);
      navigation.replace("DrawerScreen");
    }
    showToast("success", "Signed In Successfully");
  } catch (error) {
    showToast("error", "Error Occured", "Wrong credentials or No internet");
  } finally {
    if (setLoading) setLoading(false);
  }
};
