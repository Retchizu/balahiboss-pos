import React from "react";
import { Tabs } from "expo-router";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { StyleSheet } from "react-native";

const EditBottomTabLayout = () => {
  const { primary, strongPrimary, textOnPrimary } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: strongPrimary,
        tabBarInactiveTintColor: textOnPrimary,
        tabBarStyle: { backgroundColor: primary },
      }}
      initialRouteName="invoice"
    >
      <Tabs.Screen
        name="invoice"
        options={{
          title: "Invoice",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="file-invoice" size={wp(6)} color={color} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      />
      <Tabs.Screen
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="list-alt" size={wp(6)} color={color} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
        name="pos"
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="shopping-cart" size={wp(6)} color={color} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      />
    </Tabs>
  );
};

export default EditBottomTabLayout;

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: wp(3.5),
    fontFamily: "Gantari-Regular",
  },
});
