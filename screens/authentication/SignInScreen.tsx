import { StyleSheet, Image, View } from "react-native";
import React, { useState } from "react";
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

const SignInScreen = ({ navigation }: SignInScreenProp) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [userCredential, setUserCredential] = useState({
    email: "",
    password: "",
  });
  const { showToast } = useToastContext();
  return (
    <View style={styles.container}>
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
        onPress={() => signIn(userCredential, navigation, showToast)}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
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
