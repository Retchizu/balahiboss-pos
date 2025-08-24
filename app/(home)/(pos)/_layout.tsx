import { Tabs } from "expo-router";
import { SelectedProductProvider } from "@/contexts/SelectedProductContext";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { strongPrimary, primary } from "@/theme/backgroundTheme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { StyleSheet } from "react-native";

const BottomTabLayout = () => {
  return (
    <SelectedProductProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: strongPrimary,
          tabBarInactiveTintColor: "rgba(0,0,0,0.8)",
          tabBarStyle: { backgroundColor: primary },
        }}
      >
        <Tabs.Screen
          name="pos"
          options={{
            title: "Products",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="list-alt" size={wp(6)} color={color} />
            ),
            tabBarLabelStyle: styles.tabBarLabel,
          }}
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
          name="recent"
          options={{
            title: "Recent",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="history" size={wp(6)} color={color} />
            ),
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        />
      </Tabs>
    </SelectedProductProvider>
  );
};

export default BottomTabLayout;

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: wp(3.5),
    fontFamily: "Gantari-Regular",
  },
});
