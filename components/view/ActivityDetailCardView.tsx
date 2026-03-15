import { useTheme } from "@/contexts/ThemeContext";
import { DimensionValue, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
type ActivityDetailCardViewProp = {
  height?: DimensionValue | undefined;
  width?: DimensionValue | undefined;
  children: React.ReactNode;
};

const ActivityDetailCardView = ({
  children,
  width,
  height,
}: ActivityDetailCardViewProp) => {
  const { primary } = useTheme();
  return (
    <View
      style={{
        elevation: 4,
        backgroundColor: primary,
        padding: wp(1),
        borderRadius: wp(5),
        height,
        width,
      }}
    >
      <View
        style={{
          borderRadius: wp(4),
          padding: wp(4),
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default ActivityDetailCardView;