import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthScreen } from "./navigation-containers/AuthStack";
import { MainDrawerScreen } from "./navigation-containers/MainDrawer";
import { ToastProvider } from "./context/ToastContext";
import { UserProvider } from "./context/UserContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import React from "react";

const MainStack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <KeyboardProvider>
            <ToastProvider>
              <UserProvider>
                <MainStack.Navigator screenOptions={{ headerShown: false }}>
                  <MainStack.Screen name="Auth Screen" component={AuthScreen} />
                  <MainStack.Screen
                    name="DrawerScreen"
                    component={MainDrawerScreen}
                  />
                </MainStack.Navigator>
              </UserProvider>
            </ToastProvider>
          </KeyboardProvider>
        </NavigationContainer>
        <StatusBar backgroundColor="#F0D8B8" />
      </SafeAreaView>
      <Toast visibilityTime={2000} position="bottom" />
    </>
  );
}
