import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig";
import { SignInScreenProp } from "../../types/type";

export const signIn = async (
  userCredential: { email: string; password: string },
  navigation: any
) => {
  try {
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
    //handle email verification later
  } catch (error) {}
};
