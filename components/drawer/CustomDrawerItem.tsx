/* eslint-disable import/namespace */
// CustomDrawerItem.tsx
import React from "react";
import { DrawerItem } from "@react-navigation/drawer";
import * as Icons from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";
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
  activeColor: activeColorProp,
  activeBg: activeBgProp,
  role,
  restrict = false,
  pendingOrdersArray
}: CustomDrawerItemProps) {
  const { secondary, strongPrimary, textOnSecondary } = useTheme();
  const activeColor = activeColorProp ?? secondary;
  const activeBg = activeBgProp ?? strongPrimary;
  if (restrict && role !== "admin") return null;
  const isActive = state.routes[state.index].name === route;
  const IconComponent =
    icon?.family && Icons[icon.family] ? (Icons[icon.family] as any) : null;
  return (
    <DrawerItem
      label={({ color }) => (
        <DrawerLabel
          title={title}
          color={color ?? textOnSecondary}
          badgeCount={
            pendingOrdersArray?.filter((order) => order.status === "pending")
              .length
          }
        />
      )}
      icon={({ color }) => (
        <IconComponent name={icon.name} size={wp(4)} color={color ?? textOnSecondary} />
      )}
      focused={isActive}
      onPress={() => navigation.navigate(route)}
      activeTintColor={activeColor}
      inactiveTintColor={textOnSecondary}
      activeBackgroundColor={activeBg}
    />
  );
}
