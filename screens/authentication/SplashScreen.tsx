import { Image } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SplashScreenProp } from "../../types/type";
import { autoSignIn } from "../../methods/auth-methods/autoSignIn";
import { loadFont } from "../../methods/auth-methods/loadFont";
import { useUserContext } from "../../context/UserContext";
import { useAuthStateListenerAutoSignIn } from "../../hooks/useAuthStateListenerAutoSignIn";

const SplashScreen = ({ navigation }: SplashScreenProp) => {
  const result = loadFont();
  const { signUser } = useUserContext();

  /*   useEffect(() => {
    if (result) {
      autoSignIn(navigation, signUser);
    }
  }, [result]); */
  useAuthStateListenerAutoSignIn(navigation, signUser, result);

  return (
    <SafeAreaView
      style={{
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        backgroundColor: "#F3F0E9",
      }}
    >
      <Image
        source={require("../../assets/icon-transparent.png")}
        style={{ height: wp(70), width: wp(70) }}
      />
    </SafeAreaView>
  );
};

export default SplashScreen;
