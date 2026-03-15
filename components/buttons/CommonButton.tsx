/* eslint-disable import/namespace */
import React from "react";
import {
  Text,
  TouchableOpacity,
  ColorValue,
  GestureResponderEvent,
  ActivityIndicator,
  DimensionValue,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";
import * as Icons from "@expo/vector-icons";

type CommonButtonProp = {
  backgroundColor?: ColorValue;
  onPress: (event: GestureResponderEvent) => void;
  title: string;
  titleColor?: ColorValue;
  iconLeft?: {
    name: string;
    family: keyof typeof Icons;
    color?: string;
    size?: number;
  };
  row?: boolean;
  loading?: boolean;
  disabled?: boolean;
  marginTop?: DimensionValue;
};

const CommonButton = ({
  backgroundColor,
  onPress,
  title,
  iconLeft,
  titleColor,
  row,
  loading,
  marginTop,
  disabled,
}: CommonButtonProp) => {
  const { strongPrimary, textOnStrongPrimary } = useTheme();
  const IconComponent =
    iconLeft?.family && Icons[iconLeft.family]
      ? (Icons[iconLeft.family] as any)
      : null;
  return (
    <TouchableOpacity
      style={{
        borderColor: strongPrimary,
        borderWidth: wp(0.2),
        borderRadius: wp(2),
        alignItems: "center",
        padding: wp(3),
        marginTop: marginTop,
        backgroundColor: backgroundColor ?? strongPrimary,
        flexDirection: "row",
        justifyContent: "center",
        gap: wp(1),
        flex: row ? 1 : undefined,
      }}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={loading ? loading : disabled ? disabled : undefined}
    >
      {loading ? (
        <ActivityIndicator size={wp(5.5)} color={textOnStrongPrimary} />
      ) : (
        <>
          {IconComponent && iconLeft?.name && (
            <IconComponent
              name={iconLeft.name}
              size={iconLeft.size ?? wp(8)}
              color={iconLeft.color ?? textOnStrongPrimary}
              style={{ marginLeft: wp(2) }}
            />
          )}
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4.5),
              color: titleColor ?? textOnStrongPrimary,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default CommonButton;
