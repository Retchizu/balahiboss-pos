import { StyleSheet, Image, View } from "react-native";
import { useState } from "react";
import InputForm from "../../components/InputForm";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import PasswordForm from "../../components/PasswordForm";
import { handleInputChange } from "../../methods/handleInputChange";
import { Button } from "@rneui/base";
import { signIn } from "../../methods/auth-methods/signIn";
import { SignInScreenProp } from "../../types/type";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../context/ToastContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useAuthStateListenerSignIn } from "../../hooks/useAuthStateListenerSignIn";
import { ANDROID_CLIENT_ID, WEB_CLIENT_ID } from "@env";
import { useUserContext } from "../../context/UserContext";
import { useGoogleSignIn } from "../../hooks/useGoogleSignIn";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = ({ navigation }: SignInScreenProp) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [userCredential, setUserCredential] = useState({
    email: "",
    password: "",
  });
  const { showToast } = useToastContext();
  const { signUser } = useUserContext();
  const [loading, setLoading] = useState(false);

  useGoogleSignIn(response);
  useAuthStateListenerSignIn(navigation, signUser);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="position">
        <Image
          source={require("../../assets/icon-transparent.png")}
          style={styles.logo}
        />
        <InputForm
          placeholder="Email"
          onChangeText={(text) =>
            handleInputChange("email", text, setUserCredential)
          }
          autoCapitalize="none"
        />
        <PasswordForm
          isVisible={isPasswordVisible}
          setIsVisible={setIsPasswordVisible}
          placeholder="Password"
          onChangeText={(text) =>
            handleInputChange("password", text, setUserCredential)
          }
          autoCapitalize="none"
        />

        <Button
          title={"Sign In"}
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          onPress={() =>
            signIn(userCredential, navigation, showToast, signUser, setLoading)
          }
          loading={loading}
        />
        <Button
          title={"Sign In With Google"}
          buttonStyle={[styles.buttonStyle, { backgroundColor: "#DB4437" }]}
          titleStyle={[styles.titleStyle, { color: "#F3F0E9" }]}
          onPress={() => promptAsync()}
          icon={
            <AntDesign
              name="google"
              size={24}
              color="#F3F0E9"
              style={{ paddingHorizontal: wp(2) }}
            />
          }
        />
        <Toast position="bottom" autoHide visibilityTime={2000} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F0E9",
    flex: 1,
    paddingHorizontal: wp(20),
    justifyContent: "center",
  },
  logo: { height: wp(30), width: wp(30), alignSelf: "center" },
  buttonStyle: {
    marginVertical: hp(2),
    backgroundColor: "#E6B794",
    borderRadius: wp(2),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3.5),
  },
});
