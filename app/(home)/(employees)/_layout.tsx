import { SelectedEmployeeProvider } from "@/contexts/SelectedEmployee";
import { Stack } from "expo-router";

const EmployeeLayout = () => {
  return (
    <SelectedEmployeeProvider>
      <Stack>
        <Stack.Screen name="list" options={{ headerShown: false }} />
        <Stack.Screen name="details" options={{ headerShown: false }} />
        <Stack.Screen name="edit" options={{ headerShown: false }} />

      </Stack>
    </SelectedEmployeeProvider>
  );
};

export default EmployeeLayout;
