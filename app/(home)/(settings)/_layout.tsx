import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

const SettingsLayout = () => {
  const { primary } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: "Settings",
        headerTitleStyle: { fontFamily: "Gantari-SemiBold" },
        headerStyle: { backgroundColor: primary },
      }}
    >
      <Stack.Screen name="index" options={{headerShown: false}} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
};

export default SettingsLayout;
