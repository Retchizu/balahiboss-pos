import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig";
import {
  CommonActions,
  NavigationProp,
  NavigationState,
} from "@react-navigation/native";
import { User } from "../../types/type";
import { ToastType } from "react-native-toast-message";

export const signOut = async (
  navigation: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    "getState"
  > & {
    getState(): NavigationState | undefined;
  },
  signUser: (user: User | null) => void,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    await auth.signOut();
    const email = await AsyncStorage.getItem("email");
    const password = await AsyncStorage.getItem("password");
    if (email) await AsyncStorage.removeItem("email");
    if (password) await AsyncStorage.removeItem("password");
    signUser(null);

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth Screen" }],
      })
    );
    showToast("info", "Signed out successfully");
  } catch (error) {
    showToast("error", "Something went wrong", "Try again later");
  }
};
