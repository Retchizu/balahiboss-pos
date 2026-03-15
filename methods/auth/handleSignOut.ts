import { auth } from "@/config/firebaseConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOutUser } from "./signOutUser";

const STORAGE_KEY = "CHECKED_ORDERS";

export const handleSignOut = async (): Promise<{ success: boolean; error?: unknown }> => {
  try {
    await signOutUser();
    await auth.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
    router.replace("/");
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
