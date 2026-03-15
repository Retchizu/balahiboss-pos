import { View, Text } from "react-native";
import { Badge } from "react-native-paper";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";

type DrawerLabelProps = {
  title: string;
  badgeCount?: number;
  color: string;
};

export function DrawerLabel({ title, badgeCount, color }: DrawerLabelProps) {
  const { textOnSecondary } = useTheme();
  const textColor = color ?? textOnSecondary;
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{ color: textColor, fontFamily: "Gantari-SemiBold", fontSize: wp(4) }}>{title}</Text>
      {badgeCount !== undefined && badgeCount > 0 && (
        <Badge
          style={{
            backgroundColor: "#ff6347",
            marginLeft: 6,
            bottom: hp(1),
          }}
        >
          {badgeCount}
        </Badge>
      )}
    </View>
  );
}
