import React from "react";
import { Stack } from "expo-router";

const OrderDetailLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="order-details" />
    </Stack>
  );
};

export default OrderDetailLayout;
