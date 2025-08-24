import { UserProvider } from "@/contexts/UserContext";
import { auth } from "@/config/firebaseConfig";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { PendingOrderProvider } from "@/contexts/PendingOrderContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { RecentTransactionProvider } from "@/contexts/RecentTransactionContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CustomerProvider } from "@/contexts/CustomerContext";

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
      // display error
    }
  });

  return (
    <PendingOrderProvider>
      <TransactionProvider>
        <RecentTransactionProvider>
          <ProductProvider>
            <CustomerProvider>
              <UserProvider>
                <Stack>
                  <Stack.Screen
                    name="(home)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="about"
                    options={{ headerTitle: "About Us" }}
                  />
                </Stack>
              </UserProvider>
            </CustomerProvider>
          </ProductProvider>
        </RecentTransactionProvider>
      </TransactionProvider>
    </PendingOrderProvider>
  );
}
