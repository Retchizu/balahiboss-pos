import { InvoiceFormProvider } from "@/contexts/InvoiceFormContext";
import { SelectedProductProvider } from "@/contexts/SelectedProductContext";
import { Stack } from "expo-router";

const SalesReportLayout = () => {
  return (
    <SelectedProductProvider>
      <InvoiceFormProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="list" />
          <Stack.Screen name="[id]" />
          <Stack.Screen name="(edit)" />
        </Stack>
      </InvoiceFormProvider>
    </SelectedProductProvider>
  );
};

export default SalesReportLayout;
