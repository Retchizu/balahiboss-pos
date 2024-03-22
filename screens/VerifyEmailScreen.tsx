import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseconfig";
import {
  CommonActions,
  RouteProp,
  useNavigation,
} from "@react-navigation/native";
import { RootStackParamList } from "../type";
import { Button } from "@rneui/base";
import Toast from "react-native-simple-toast";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
type VerifyEmailScreenProp = {
  route: RouteProp<RootStackParamList, "VerifyEmailScreen">;
};
const VerifyEmailScreen = ({ route }: VerifyEmailScreenProp) => {
  const email = route.params;
  const navigation = useNavigation();
  const sendEmailVerification = async () => {
    const user = auth.currentUser;
    user?.reload();
    if (!user?.emailVerified) {
      await user?.sendEmailVerification({
        handleCodeInApp: true,
        url: "https://sales-tracker-ios-android.firebaseapp.com",
      });
      Toast.show(
        "Verification email sent. Please check your email.",
        Toast.LONG
      );
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
      }}
    >
      <Text>
        Account verifcation for{" "}
        {email.slice(0, 2) +
          "*".repeat(email.length / 2 - 2) +
          email.slice(email.length / 2)}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "500" }}>
        Please check your email to verify your account
      </Text>

      <Button
        onPress={sendEmailVerification}
        title={"Resend email verification"}
        containerStyle={{
          borderRadius: 10,
          marginTop: 10,
        }}
        buttonStyle={{ backgroundColor: "pink" }}
      />
      <TouchableOpacity
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: "ForgotPasswordScreen",
              params: { resetAccount: true },
            })
          )
        }
      >
        <Text style={{ color: "#6c7ae6", marginTop: 30 }}>
          Never created an account with this email?
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({});
