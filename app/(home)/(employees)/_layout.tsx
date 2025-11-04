import { SelectedEmployeeProvider } from "@/contexts/SelectedEmployee";
import { TimesheetProvider } from "@/contexts/TimesheetContext";
import { Stack } from "expo-router";

const EmployeeLayout = () => {
  return (
    <SelectedEmployeeProvider>
      <TimesheetProvider>
        <Stack>
          <Stack.Screen name="list" options={{ headerShown: false }} />
          <Stack.Screen name="details" options={{ headerShown: false }} />
          <Stack.Screen name="edit" options={{ headerShown: false }} />
        </Stack>
      </TimesheetProvider>
    </SelectedEmployeeProvider>
  );
};

export default EmployeeLayout;
