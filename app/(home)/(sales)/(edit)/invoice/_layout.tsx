import React from "react";
import { Stack } from "expo-router";

const EditInvoiceLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="preview" />
    </Stack>
  );
};

export default EditInvoiceLayout;
