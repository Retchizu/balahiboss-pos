import * as SecureStore from "expo-secure-store";
import { User } from "../../types/type";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const autoSignIn = async (
  navigation: any,
  signUser: (user: User | null) => void
) => {
  try {
    const email = await SecureStore.getItemAsync("email");
    const password = await SecureStore.getItemAsync("password");
    if (email && password) {
      const signInResult = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (signInResult.user) {
        const user: User = {
          uid: signInResult.user.uid!,
          email: signInResult.user.email!,
          displayName: signInResult.user.displayName!,
        };
        signUser(user);
        navigation.replace("DrawerScreen");
      }
    } else {
      navigation.replace("SignInScreen");
    }
  } catch (error) {
    navigation.replace("SignInScreen");
  }
};
