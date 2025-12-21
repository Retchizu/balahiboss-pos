import { UserProvider } from "@/contexts/UserContext";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { PendingOrderProvider } from "@/contexts/PendingOrderContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { RecentTransactionProvider } from "@/contexts/RecentTransactionContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import { ImageBackground, View, StyleSheet } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Gantari-Black": require("@/assets/fonts/Gantari-Black.ttf"),
    "Gantari-Bold": require("@/assets/fonts/Gantari-Bold.ttf"),
    "Gantari-ExtraBold": require("@/assets/fonts/Gantari-ExtraBold.ttf"),
    "Gantari-ExtraLight": require("@/assets/fonts/Gantari-ExtraLight.ttf"),
    "Gantari-Light": require("@/assets/fonts/Gantari-Light.ttf"),
    "Gantari-Medium": require("@/assets/fonts/Gantari-Medium.ttf"),
    "Gantari-Regular": require("@/assets/fonts/Gantari-Regular.ttf"),
    "Gantari-SemiBold": require("@/assets/fonts/Gantari-SemiBold.ttf"),
    "Gantari-Thin": require("@/assets/fonts/Gantari-Thin.ttf"),
    "Gantari-Italic": require("@/assets/fonts/Gantari-Italic.ttf"),
  });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      router.replace("/(home)/(pos)/pos");
    } else {
      // router.replace("/");
    }
  });

  return (
    <UserProvider>
      <PendingOrderProvider>
        <ProductProvider>
          <TransactionProvider>
            <RecentTransactionProvider>
              <CustomerProvider>
                <Stack>
                  <Stack.Screen
                    name="(home)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="about" options={{ headerShown: false }} />
                </Stack>
                <Toast config={toastConfig} position="bottom" />
              </CustomerProvider>
            </RecentTransactionProvider>
          </TransactionProvider>
        </ProductProvider>
      </PendingOrderProvider>
    </UserProvider>
  );
}

const toastConfig: ToastConfig = {
  success: (params: ToastConfigParams<any>) => (
    <View style={styles.main}>
      <ImageBackground
        source={require("@/assets/balahiboss.png")}
        style={styles.background}
        imageStyle={styles.image}
      >
        <BaseToast
          {...params}
          style={[
            styles.toast,
            {
              backgroundColor: "transparent",
              borderColor: "#60B5FF",
              borderLeftWidth: wp(1),
              elevation: 0,
            },
          ]}
          contentContainerStyle={{ paddingHorizontal: wp(4) }}
          text1Style={{
            fontSize: wp(4),
            color: "black",
            fontFamily: "Gantari-SemiBold",
          }}
          text1NumberOfLines={3}
        />
      </ImageBackground>
    </View>
  ),

  error: (params: ToastConfigParams<any>) => (
    <View style={styles.main}>
      <ImageBackground
        source={require("@/assets/balahiboss.png")}
        style={styles.background}
        imageStyle={styles.image}
      >
        <ErrorToast
          {...params}
          style={[
            styles.toast,
            {
              backgroundColor: "transparent",
              borderColor: "#FF8989",
              borderLeftWidth: wp(1),
              elevation: 0,
            },
          ]}
          text1Style={{
            fontSize: wp(4),
            color: "black",
            fontFamily: "Gantari-SemiBold",
          }}
          text1NumberOfLines={3}
        />
      </ImageBackground>
    </View>
  ),
};

const styles = StyleSheet.create({
  main: {
    zIndex: 1,
    backgroundColor: "white",
    alignItems: "center",
    elevation: 1,
  },
  background: {
    zIndex: 2,
  },
  image: {
    resizeMode: "center",
    opacity: 0.2,
  },
  toast: {
    alignSelf: "center", // centers horizontally
  },
});
