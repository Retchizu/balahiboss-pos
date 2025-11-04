/* eslint-disable import/namespace */
import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Icons from "@expo/vector-icons";

type FloatingButtonProp = {
  onPress: () => void;
  icon: {
    name: string;
    family: keyof typeof Icons;
    color: string;
    size: number;
  };
  backgroundColor: string;
  loading?: boolean;
  zIndex?: number;
};

const FloatingButton = ({
  onPress,
  icon,
  backgroundColor,
  loading,
  zIndex
}: FloatingButtonProp) => {
  const IconComponent = Icons[icon.family] ? (Icons[icon.family] as any) : null;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: backgroundColor, zIndex: zIndex ?? undefined}]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <IconComponent name={icon.name} size={icon.size} color={icon.color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: hp(4),
    right: wp(6),
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7), // half of width/height = circle
    backgroundColor: "#1e90ff", // or your strongPrimary
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});

export default FloatingButton;
