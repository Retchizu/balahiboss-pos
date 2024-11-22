import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SplashScreenProp } from "../../types/type";
import { loadFont } from "../../methods/auth-methods/loadFont";
import { useUserContext } from "../../context/UserContext";
import { useAuthStateListenerAutoSignIn } from "../../hooks/useAuthStateListenerAutoSignIn";
import { StatusBar } from "expo-status-bar";

const SplashScreen = ({ navigation }: SplashScreenProp) => {
  const result = loadFont();
  const { signUser } = useUserContext();

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
      <StatusBar hidden />
    </SafeAreaView>
  );
};

export default SplashScreen;
