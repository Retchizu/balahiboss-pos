import { ActivityProvider } from "@/contexts/ActivityContext";
import { Stack } from "expo-router";

const ActivityLayout = () => {
  return (
    <ActivityProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="list" />
        <Stack.Screen name="transaction" />
      </Stack>
    </ActivityProvider>
  );
};

export default ActivityLayout;
