import React from "react";

import { Stack } from "expo-router";

const RecentStackLayout = () => {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
    </Stack>
  );
};

export default RecentStackLayout;