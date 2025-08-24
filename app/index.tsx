import { Image } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleSignInButton from "@/components/buttons/GoogleSignInButton";
import {
  getIdTokenResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { isAxiosError } from "axios";
import { verifyAccountApi } from "@/methods/auth/verifyAccountApi";
import { router } from "expo-router";
import { useUserContext } from "@/contexts/UserContext";

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const { setRole } = useUserContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [request, response, promptasync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: "com.retchizu.balahiboss",
      path: "/",
    }),
  });

  const [isFetchingUser, setIsFetchingUser] = useState(true); // fetch existing user
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);
  useEffect(() => {
    // this runs after lugin
    if (response?.type === "success") {
      const { id_token } = response.params;

      handleGoogleSignIn(id_token, setIsGoogleSignInLoading);
    }
  }, [response]);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const tokenResult = await getIdTokenResult(user, true);
      setRole(tokenResult.claims.role as string);
      router.replace("/(home)/(pos)/pos");
    } else {
      // display error
    }
    setIsFetchingUser(false);
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFFDF0",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isFetchingUser ? (
        <Image
          source={require("../assets/balahiboss.png")}
          style={{ width: wp(50), height: wp(50) }}
        />
      ) : (
        <>
          <Image
            source={require("../assets/balahiboss.png")}
            style={{ width: wp(50), height: wp(50) }}
          />
          <GoogleSignInButton
            onPress={() => {
              promptasync();
            }}
            isLoading={isGoogleSignInLoading}
            disabled={isGoogleSignInLoading}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default AuthScreen;

const handleGoogleSignIn = async (
  idToken: string,
  setIsGoogleSignInLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    setIsGoogleSignInLoading(true);
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    await verifyAccountApi();
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      if (error.response.status === 403 || error.response.status) {
        await auth.signOut();
      } else {
        console.log(error.message);
      }
    }
    console.error("Google Sign-In Error:", (error as Error).message);
  } finally {
    setIsGoogleSignInLoading(false);
  }
};
