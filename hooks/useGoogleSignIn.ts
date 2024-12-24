import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";
import { AuthSessionResult } from "expo-auth-session";

export const useGoogleSignIn = (
  response: AuthSessionResult | null,
  setGoogleLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  useEffect(() => {
    if (response?.type == "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    } else {
      setGoogleLoading(false);
    }
  }, [response]);
};
