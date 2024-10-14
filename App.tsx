import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthScreen } from "./navigation-containers/AuthStack";
import { MainDrawerScreen } from "./navigation-containers/MainDrawer";
import { ToastProvider } from "./context/ToastContext";
import { UserProvider } from "./context/UserContext";

const MainStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
