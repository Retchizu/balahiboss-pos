import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Octicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseconfig";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../type";

import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-simple-toast";
import { Ionicons } from "@expo/vector-icons";
import Dialog from "react-native-dialog";
import { Input } from "@rneui/base";
import { Entypo } from "@expo/vector-icons";
import firebase from "firebase/compat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSalesReportContext } from "../context/salesReportContext";
import { useExpenseReportContext } from "../context/expenseReportContext";
import { useProductContext } from "../context/productContext";
import { useCustomerContext } from "../context/customerContext";
type Props = BottomTabScreenProps<RootStackParamList, "Settings">;

const SettingScreen = ({ navigation }: Props) => {
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userName, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(true);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(true);
  const { setSalesReportList } = useSalesReportContext();
  const { setExpense } = useExpenseReportContext();
  const { setProductList } = useProductContext();
  const { setCustomerList } = useCustomerContext();

  console.log(auth.currentUser?.displayName);

  const toggleOldPasswordVisibility = () => {
    setIsOldPasswordVisible((prevVisibility) => !prevVisibility);
  };
  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible((prevVisibility) => !prevVisibility);
  };
  const changeUserName = async () => {
    await auth.currentUser?.updateProfile({
      displayName: userName,
    });
    Toast.show("Username changed", Toast.SHORT);
    handeChangeUsernameCancel();
  };

  const changePassword = async () => {
    try {
      if (currentPassword === newPassword) {
        Toast.show(
          "New password must be different from the current password",
          Toast.SHORT
        );
        return;
      }

      const user = auth.currentUser;
      const credentials = firebase.auth.EmailAuthProvider.credential(
        user?.email || "",
        currentPassword
      );
      await user?.reauthenticateWithCredential(credentials);

      await user?.updatePassword(newPassword);

      Toast.show("Password updated", Toast.SHORT);
      handelChangePasswordCancel();
    } catch (error) {
      Toast.show("Error updating password. Please try again.", Toast.SHORT);
    }
  };
  const handelChangePasswordVisibility = () => {
    setIsChangingPassword(true);
  };
  const handelChangePasswordCancel = () => {
    setIsChangingPassword(false);
  };
  const handleChangeUserNameVisibility = () => {
    setIsChangingUsername(true);
  };
  const handeChangeUsernameCancel = () => {
    setIsChangingUsername(false);
  };
  const handleSignOut = async () => {
    try {
      await auth
        .signOut()
        .then(() => Toast.show("Sign out successful", Toast.SHORT));
      await AsyncStorage.clear();
      AsyncStorage.clear();
      setSalesReportList([]);
      setCustomerList([]);
      setExpense([]);
      setProductList([]);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "LogInScreen",
            },
          ],
        })
      );
    } catch (error) {
      console.error("Error signing out:", (error as Error).message);
    }
  };

  const settingMenu = [
    { key: 1, label: "Sign Out", icon: "signout" },
    { key: 2, label: "Change username", icon: "username" },
    { key: 3, label: "Change password", icon: "password" },
  ];
  const iconSeparator = (label: string) => {
    switch (label) {
      case "Sign Out":
        return <Octicons name="sign-out" size={24} color="#5f0573" />;
      case "Change username":
        return <Ionicons name="person" size={24} color="#5f0573" />;
      case "Change password":
        return <Entypo name="lock" size={24} color="#5f0573" />;
    }
  };

  const methodSeparator = (label: string) => {
    switch (label) {
      case "Sign Out":
        return handleSignOut();
      case "Change username":
        return handleChangeUserNameVisibility();
      case "Change password":
        return handelChangePasswordVisibility();
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <FlatList
        style={{ marginHorizontal: 10 }}
        data={settingMenu}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => methodSeparator(item.label)}>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  borderBottomWidth: 2,
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 0.06 }}>{iconSeparator(item.label)}</View>

                <Text style={{ marginLeft: 10, flex: 1 }}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
      {isChangingUsername && (
        <Dialog.Container visible>
          <Dialog.Title>Change Username</Dialog.Title>
          <View>
            <Input
              placeholder={"Enter new username"}
              value={userName}
              onChangeText={(text) => setUsername(text)}
              containerStyle={{
                borderWidth: 2,
                borderColor: "#af71bd",
                borderRadius: 5,
              }}
              inputContainerStyle={{ borderBottomWidth: 0 }}
            />
          </View>
          <Dialog.Button label="Cancel" onPress={handeChangeUsernameCancel} />
          <Dialog.Button label="Confirm" onPress={changeUserName} />
        </Dialog.Container>
      )}
      {isChangingPassword && (
        <Dialog.Container visible>
          <Dialog.Title>Change Password</Dialog.Title>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: 8,
                paddingHorizontal: 14,
                borderColor: "#af71bd",
                borderWidth: 2,
              }}
            >
              <TextInput
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={(text) => setCurrentPassword(text)}
                style={{
                  flex: 1,
                  color: "#333",
                  paddingVertical: 10,
                  paddingRight: 10,
                  fontSize: 16,
                }}
                secureTextEntry={isOldPasswordVisible}
              />
              <TouchableOpacity onPress={toggleOldPasswordVisibility}>
                <Entypo
                  name={isOldPasswordVisible ? "eye-with-line" : "eye"}
                  size={24}
                  color="black"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: 8,
                paddingHorizontal: 14,
                borderColor: "#af71bd",
                borderWidth: 2,
              }}
            >
              <TextInput
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(text) => setNewPassword(text)}
                style={{
                  flex: 1,
                  color: "#333",
                  paddingVertical: 10,
                  paddingRight: 10,
                  fontSize: 16,
                }}
                secureTextEntry={isNewPasswordVisible}
              />
              <TouchableOpacity onPress={toggleNewPasswordVisibility}>
                <Entypo
                  name={isNewPasswordVisible ? "eye-with-line" : "eye"}
                  size={24}
                  color="black"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Dialog.Button label="Cancel" onPress={handelChangePasswordCancel} />
          <Dialog.Button label="Confirm" onPress={changePassword} />
        </Dialog.Container>
      )}
      <Text style={{ color: "gray", textAlign: "center" }}>
        Exclusive Version for Balahiboss Sales and Expense Tracking
      </Text>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({});
