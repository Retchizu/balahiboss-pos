import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/authentication/SignInScreen";
import SplashScreen from "../screens/authentication/SplashScreen";
import { AuthStackParamList } from "../types/type";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export const AuthScreen = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#F0D8B8",
      },
    }}
  >
    <AuthStack.Screen
      name="SplashScreen"
      component={SplashScreen}
      options={{ headerShown: false }}
    />
    <AuthStack.Screen
      name="SignInScreen"
      component={SignInScreen}
      options={{
        headerTitle: "Sign In",
        headerTitleStyle: { fontFamily: "SoraBold", color: "#634F40" },
      }}
    />
  </AuthStack.Navigator>
);
