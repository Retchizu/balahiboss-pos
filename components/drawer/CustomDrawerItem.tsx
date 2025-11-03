/* eslint-disable import/namespace */
// CustomDrawerItem.tsx
import React from "react";
import { DrawerItem } from "@react-navigation/drawer";
import * as Icons from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { secondary, strongPrimary } from "@/theme/backgroundTheme";
import { DrawerLabel } from "./DrawerLabel";
import PendingOrder from "@/types/PendingOrder";

interface CustomDrawerItemProps {
  title: string;
  icon: {
    name: string;
    family: keyof typeof Icons;
  };
  route: string;
  navigation: any;
  state: any;
  role?: string;
  restrict?: boolean;
  activeColor?: string;
  activeBg?: string;
  inactiveBg?: string;
  pendingOrdersArray?: PendingOrder[]
}

export default function CustomDrawerItem({
  title,
  icon,
  route,
  navigation,
  state,
  activeColor = secondary,
  activeBg = strongPrimary,
  role,
  restrict = false,
  pendingOrdersArray
}: CustomDrawerItemProps) {
  if (restrict && role !== "admin") return null;
  const isActive = state.routes[state.index].name === route;
  const IconComponent =
    icon?.family && Icons[icon.family] ? (Icons[icon.family] as any) : null;
  return (
    <DrawerItem
      label={({ color }) => (
        <DrawerLabel
          title={title}
          color={color}
          badgeCount={
            pendingOrdersArray?.filter((order) => order.status === "pending")
              .length
          }
        />
      )}
      icon={({ color }) => (
        <IconComponent name={icon.name} size={wp(4)} color={color} />
      )}
      focused={isActive}
      onPress={() => navigation.navigate(route)}
      activeTintColor={activeColor}
      activeBackgroundColor={activeBg}
    />
  );
}
