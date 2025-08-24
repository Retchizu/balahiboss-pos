import { Feather, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Tabs } from "expo-router";
import { primary, strongPrimary } from "@/theme/backgroundTheme";

const PendingLayout = () => {
  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: strongPrimary,
          tabBarInactiveTintColor: "rgba(0,0,0,0.8)",
          tabBarStyle: { backgroundColor: primary },
        }}
      >
        <Tabs.Screen
          name="pending"
          options={{
            title: "Pending",
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="pending" size={wp(6)} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="packed"
          options={{
            title: "Packed",
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="box" size={wp(6)} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="complete"
          options={{
            title: "Complete",
            tabBarIcon: ({ color }) => (
              <Feather name="check-circle" size={wp(6)} color={color} />
            ),
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
      </Tabs>
  );
};

export default PendingLayout;

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: wp(3.5),
    fontFamily: "Gantari-Regular",
  },
});
