import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Image, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/config/firebaseConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomDrawerItem from "./CustomDrawerItem";
import { useUserContext } from "@/contexts/UserContext";
import usePendingOrdersArray from "@/hooks/usePendingOrdersArray";
import { useMemo } from "react";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";

const STORAGE_KEY = "CHECKED_ORDERS";

const CustomDrawerComponent = (props: DrawerContentComponentProps) => {
  const { navigation, state } = props; // state contains current route info
  const { role } = useUserContext();
  const { orders } = usePendingOrderContext();
  const { pendingOrdersArray } = usePendingOrdersArray(orders);
  const pendingOrders = useMemo(() => {
    return pendingOrdersArray.filter((order) => order.status === "pending");
  }, [pendingOrdersArray]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#AFDDFF" }}>
      <Image
        source={require("../../assets/balahiboss.png")}
        style={{
          width: wp(25),
          height: wp(25),
          alignSelf: "center",
        }}
      />
      <Text style={styles.drawerHeaderTitle}>Advanced POS</Text>
      <Text style={styles.displayNameStyle}>
        {auth.currentUser?.displayName}
      </Text>
      <DrawerContentScrollView scrollEnabled={true}>
        <Section title="Main" />
        <CustomDrawerItem
          title="POS"
          icon={{ family: "Ionicons", name: "keypad-sharp" }}
          navigation={navigation}
          route="(pos)"
          state={state}
        />

        <CustomDrawerItem
          title="Orders"
          icon={{ family: "MaterialIcons", name: "pending-actions" }}
          navigation={navigation}
          route="(pending)"
          state={state}
          pendingOrdersArray={pendingOrders}
        />
        <CustomDrawerItem
          title="Printers"
          icon={{ family: "Entypo", name: "print" }}
          navigation={navigation}
          route="(printers)"
          state={state}
        />
        <Section title="Inventory & Clients" restrict role={role} />
        <CustomDrawerItem
          title="Products"
          icon={{ family: "Feather", name: "package" }}
          navigation={navigation}
          route="(products)"
          state={state}
          restrict
          role={role}
        />

        <CustomDrawerItem
          title="Customers"
          icon={{ family: "Feather", name: "users" }}
          navigation={navigation}
          route="(customer)"
          state={state}
          restrict
          role={role}
        />

        <Section title="Reports" restrict role={role} />
        <CustomDrawerItem
          title="Sales"
          icon={{ family: "MaterialCommunityIcons", name: "google-analytics" }}
          navigation={navigation}
          route="(sales)"
          state={state}
          restrict
          role={role}
        />
        <CustomDrawerItem
          title="Stocks"
          icon={{ family: "Entypo", name: "line-graph" }}
          navigation={navigation}
          route="(stocks)"
          state={state}
          restrict
          role={role}
        />
        <CustomDrawerItem
          title="Employees"
          icon={{ family: "Foundation", name: "torso-business" }}
          navigation={navigation}
          route="(employees)"
          state={state}
          restrict
          role={role}
        />
        <CustomDrawerItem
          title="Activity"
          icon={{ family: "FontAwesome", name: "history" }}
          navigation={navigation}
          route="(activity)"
          state={state}
          restrict
          role={role}
        />

        <Divider />
        <DrawerItem
          label={({ color }) => (
            <Text style={[styles.drawerLabelStyle, { color }]}>About Us</Text>
          )}
          onPress={() => {
            router.navigate("/about");
          }}
          icon={({ color }) => (
            <MaterialIcons name="info-outline" size={wp(4.5)} color={color} />
          )}
        />

        <DrawerItem
          label={({ color }) => (
            <Text style={[styles.drawerLabelStyle, { color }]}>Sign out</Text>
          )}
          onPress={async () => {
            await auth.signOut();
            AsyncStorage.removeItem(STORAGE_KEY);
            router.replace("/");
          }}
          icon={({ color }) => (
            <Ionicons
              name="exit-outline"
              size={wp(4.5)}
              color={color}
              style={{ alignSelf: "center", top: hp(0.2) }}
            />
          )}
        />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

export default CustomDrawerComponent;

const styles = StyleSheet.create({
  drawerHeaderTitle: {
    fontFamily: "Gantari-SemiBold",
    color: "#634F40",
    fontSize: wp(6),
    textAlign: "center",
  },
  drawerLabelStyle: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
  displayNameStyle: {
    textAlign: "center",
    fontFamily: "Gantari-Regular",
    fontSize: wp(4),
  },
  section: {
    marginTop: hp(1),
  },
  sectionHeader: {
    fontSize: wp(5),
    fontFamily: "Gantari-SemiBold",
    paddingHorizontal: wp(4),
    opacity: 0.6,
  },
});

const Divider = () => (
  <View
    style={{
      borderTopWidth: wp(0.3),
      opacity: 0.6,
      marginVertical: hp(0.5),
    }}
  />
);

const Section = ({
  title,
  role,
  restrict = false,
}: {
  title: string;
  role?: string;
  restrict?: boolean;
}) => {
  if (restrict && role !== "admin") return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );
};
