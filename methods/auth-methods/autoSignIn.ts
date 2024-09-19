import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig";

export const autoSignIn = async (navigation: any) => {
  try {
    const email = await AsyncStorage.getItem("email");
    const password = await AsyncStorage.getItem("password");

    if (email && password) {
      await auth.signInWithEmailAndPassword(email, password);
      navigation.replace("DrawerScreen");
    } else {
      navigation.replace("SignInScreen");
    }
  } catch (error) {
    navigation.replace("SignInScreen");
  }
};
