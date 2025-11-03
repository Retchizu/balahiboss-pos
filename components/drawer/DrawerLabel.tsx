import { View, Text } from "react-native";
import { Badge } from "react-native-paper"; // or whatever badge you're using
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

type DrawerLabelProps = {
  title: string;
  badgeCount?: number;
  color: string;
};

export function DrawerLabel({ title, badgeCount, color }: DrawerLabelProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{color, fontFamily:"Gantari-SemiBold", fontSize:wp(4)}}>{title}</Text>
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
