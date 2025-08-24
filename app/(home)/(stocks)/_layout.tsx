import React from "react";
import { Stack } from "expo-router";

const StockReportLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="list" />
    </Stack>
  );
};

export default StockReportLayout;
