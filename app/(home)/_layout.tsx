import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TouchableOpacity, View} from "react-native";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import { Badge } from "react-native-paper";
import { useEffect, useMemo } from "react";
import usePendingOrdersArray from "@/hooks/usePendingOrdersArray";
import CustomDrawerComponent from "@/components/drawer/CustomDrawerComponent";
import { DrawerLabel } from "@/components/drawer/DrawerLabel";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useUserContext } from "@/contexts/UserContext";
import { useAudioPlayer } from "expo-audio";
import { auth } from "@/config/firebaseConfig";
import Foundation from '@expo/vector-icons/Foundation';

const pendingOrderRingtone = require("@/assets/alert/pending.mp3");

const DrawerLayout = () => {
  const { orders } = usePendingOrderContext();
  const { pendingOrdersArray } = usePendingOrdersArray(orders);
  const pendingOrders = useMemo(() => {
    return pendingOrdersArray.filter((order) => order.status === "pending");
  }, [pendingOrdersArray]);

  const { role } = useUserContext();

  const player = useAudioPlayer(pendingOrderRingtone);

  useEffect(() => {
    if (role === "admin") return;
    if (
      pendingOrders.filter((order) => order.status === "pending").length === 0
    )
      return;

    const currentUser = auth.currentUser;
    const uncheckedPendingOrder = pendingOrdersArray
      .filter((order) => order.status === "pending" && order.checkedBy !== undefined)
      .some((order) => !order.checkedBy.includes(currentUser?.uid!));

    const loopPlayer = setInterval(() => {
      if (uncheckedPendingOrder) {
        player.seekTo(0);
        player.play();
      } else {
        player.pause();
      }
    }, 7000);

    return () => clearInterval(loopPlayer);
  }, [pendingOrders, pendingOrdersArray, player, role]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={({ navigation }) => ({
          headerTitleStyle: {
            fontFamily: "Gantari-SemiBold",
          },
          headerStyle: { backgroundColor: primary },
          headerLeft: () => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: wp(2),
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.openDrawer();
                  }}
                  style={{
                    backgroundColor: secondary,
                    padding: wp(3),
                    borderRadius: wp(3),
                  }}
                >
                  <FontAwesome name="reorder" size={wp(5)} color="black" />
                </TouchableOpacity>
                {pendingOrders.length > 0 && (
                  <Badge
                    style={{
                      backgroundColor: "#ff6347",
                      bottom: hp(3),
                      right: wp(3),
                    }}
                  >
                    {pendingOrders.length}
                  </Badge>
                )}
              </View>
            );
          },
          drawerActiveTintColor: secondary,
          drawerActiveBackgroundColor: strongPrimary,
        })}
        drawerContent={(props) => <CustomDrawerComponent {...props} />}
      >
        <Drawer.Screen
          name="(pos)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="POS" color={color} />
            ),
            title: "POS",
            drawerIcon: ({ color }) => (
              <Ionicons name="keypad-sharp" size={wp(5)} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="(customer)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Customers" color={color} />
            ),
            title: "Customers",
            drawerIcon: ({ color }) => (
              <Feather name="users" size={wp(5)} color={color} />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />

        <Drawer.Screen
          name="(products)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Products" color={color} />
            ),
            title: "Products",
            drawerIcon: ({ color }) => (
              <Feather name="package" size={wp(5)} color={color} />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />

        <Drawer.Screen
          name="(sales)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Sales Report" color={color} />
            ),
            title: "Sales Report",
            drawerIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="google-analytics"
                size={wp(5)}
                color={color}
              />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />
        <Drawer.Screen
          name="(analytics)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Analytics" color={color} />
            ),
            title: "Analytics",
            drawerIcon: ({ color }) => (
              <MaterialCommunityIcons name="chart-line" size={wp(5)} color={color} />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />
        <Drawer.Screen
          name="(stocks)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Stocks Report" color={color} />
            ),
            title: "Stocks Report",
            drawerIcon: ({ color }) => (
              <Entypo name="line-graph" size={24} color={color} />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />

        <Drawer.Screen
          name="(employees)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Employees" color={color} />
            ),
            title: "Employees",
            drawerIcon: ({ color }) => (
              <Foundation name="torso-business" size={24} color={color} />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />

        <Drawer.Screen
          name="(pending)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel
                title="Pending Orders"
                badgeCount={
                  pendingOrdersArray.filter(
                    (order) => order.status === "pending"
                  ).length
                }
                color={color}
              />
            ),
            title: "Pending Orders",
            drawerIcon: ({ color }) => (
              <MaterialIcons
                name="pending-actions"
                size={wp(5)}
                color={color}
              />
            ),
          }}
        />

        <Drawer.Screen
          name="(activity)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Activity Log" color={color} />
            ),
            title: "Activity Log",
            drawerIcon: ({ color }) => (
              <FontAwesome name="history" size={wp(5)} color={color} />
            ),
            drawerItemStyle: role === "user" ? { display: "none" } : undefined,
          }}
        />

        <Drawer.Screen
          name="(printers)"
          options={{
            drawerLabel: ({ color }) => (
              <DrawerLabel title="Printers" color={color} />
            ),
            title: "Printers",
            drawerIcon: ({ color }) => (
              <Entypo name="print" size={wp(5)} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
