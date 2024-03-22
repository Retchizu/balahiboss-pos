import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "@rneui/base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type";
import { auth } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { Entypo } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "SignUpScreen">;

const SignUpScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(true);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(true);

  const toggleOldPasswordVisibility = () => {
    setIsOldPasswordVisible((prevVisibility) => !prevVisibility);
  };
  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible((prevVisibility) => !prevVisibility);
  };

  const handleSignUp = async () => {
    if (email && userName && confirmPass) {
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(
          email,
          confirmPass
        );

        const user = userCredential.user;

        if (user) {
          await user.sendEmailVerification({
            handleCodeInApp: true,
            url: "https://sales-tracker-ios-android.firebaseapp.com",
          });
          Toast.show(
            "Verification email sent. Please check your email.",
            Toast.LONG
          );
          await user.updateProfile({
            displayName: userName,
          });
        }
        navigation.goBack();
      } catch (error) {
        if (password.length <= 5)
          Toast.show("Password shoud be at least 6 characters", Toast.SHORT);
      }
    } else {
      Toast.show("Please complete your credentials", Toast.SHORT);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.credentialContainer}>
        <Text style={styles.welcomeMessage}>Welcome to Retchi!</Text>
        <View style={styles.credentialChild}>
          <Text style={styles.inputLabel}>Enter your email:</Text>

          <TextInput
            placeholder="Email"
            style={styles.inputDesign}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
            }}
          />
          <Text style={styles.inputLabel}>Enter your desired username:</Text>
          <TextInput
            placeholder="Username"
            style={styles.inputDesign}
            value={userName}
            onChangeText={(text) => {
              setUserName(text);
            }}
          />
          <Text style={styles.inputLabel}>Enter your password:</Text>
          <View>
            <View style={styles.textInputStyle}>
              <TextInput
                placeholder="Enter current password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                style={{
                  flex: 1,
                  paddingVertical: 2,
                  paddingRight: 10,
                  fontSize: 16,
                  paddingLeft: 5,
                  fontWeight: "300",
                }}
                secureTextEntry={isOldPasswordVisible}
              />
              <TouchableOpacity onPress={toggleOldPasswordVisibility}>
                <Entypo
                  name={isOldPasswordVisible ? "eye-with-line" : "eye"}
                  size={20}
                  color="black"
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Confirm your password:</Text>
            <View style={styles.textInputStyle}>
              <TextInput
                placeholder="Confirm password"
                value={confirmPass}
                style={{
                  flex: 1,
                  paddingVertical: 2,
                  paddingRight: 10,
                  fontSize: 16,
                  paddingLeft: 5,
                  fontWeight: "300",
                }}
                onChangeText={(text) => setConfirmPass(text)}
                secureTextEntry={isNewPasswordVisible}
              />
              <TouchableOpacity onPress={toggleNewPasswordVisibility}>
                <Entypo
                  name={isNewPasswordVisible ? "eye-with-line" : "eye"}
                  size={20}
                  color="black"
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Button
            title={"Sign Up"}
            containerStyle={{
              borderRadius: 15,
              paddingHorizontal: 5,
            }}
            buttonStyle={{ backgroundColor: "#e66cb9" }}
            titleStyle={{ fontSize: 15 }}
            onPress={handleSignUp}
          />
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text
              style={{
                color: "#6c7ae6",
                marginTop: 10,
                paddingHorizontal: 10,
                fontSize: 18,
                fontWeight: "500",
              }}
            >
              Already have an account? Sign In!
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  welcomeMessage: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 30,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: "#f7f7f7",
    flex: 1,
  },
  credentialContainer: {
    alignSelf: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 10,
  },
  credentialChild: {
    borderWidth: 6,
    borderColor: "#d49fc0",
    borderRadius: 10,
    padding: 20,
  },
  inputDesign: {
    borderWidth: 2,
    borderColor: "#e66cb9",
    paddingHorizontal: 10,
    fontWeight: "300",
    fontSize: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  inputLabel: {
    marginBottom: 10,
    fontSize: 20,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  textInputStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#e66cb9",
  },
});
