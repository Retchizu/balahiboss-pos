import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type";

type Prop = NativeStackScreenProps<RootStackParamList, "ForgotPasswordScreen">;

const ForgotPasswordScreen = ({ navigation, route }: Prop) => {
  const [email, setEmail] = useState("");
  const notOriginalUser = route.params;
  console.log(auth.currentUser);
  const requestResetEmail = async (email: string) => {
    try {
      await auth.sendPasswordResetEmail(email);
      Toast.show("Password reset request sent! Check your email.", Toast.SHORT);
      if (notOriginalUser) {
        await auth.currentUser?.updateProfile({
          displayName: "",
        });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show((error as Error).message, Toast.SHORT);
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
      <Text style={{ fontSize: 18, fontWeight: "500" }}>
        Reset your password
      </Text>
      <View style={{ flexDirection: "row" }}>
        <TextInput
          placeholder="Enter your email"
          style={{
            borderWidth: 2,
            borderColor: "#e66cb9",
            paddingHorizontal: 10,
            marginHorizontal: 40,
            fontSize: 15,
            borderRadius: 8,
            fontWeight: "300",
            flex: 1,
          }}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
          }}
          onSubmitEditing={() => requestResetEmail(email)}
        />
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({});
