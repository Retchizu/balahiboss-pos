import { FC } from "react";
import { View, Text } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";

type RenderLabelValuePairProps = {
  label: string;

  value: string;
};

const RenderLabelValuePair: FC<RenderLabelValuePairProps> = ({
  label,

  value,
}) => {
  const { textOnPrimary, textMuted } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          fontFamily: "Gantari-SemiBold",
          fontSize: wp(4),
          color: textMuted,
          flex:1
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          fontFamily: "Gantari-Regular",
          fontSize: wp(4),
          textAlign: "right",
          flex: 2,
          color: textOnPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
};


export default RenderLabelValuePair