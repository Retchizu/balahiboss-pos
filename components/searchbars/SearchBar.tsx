import { View, TextInput } from "react-native";
import React from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { secondary } from "@/theme/backgroundTheme";
import Entypo from "@expo/vector-icons/Entypo";

type SearchBarProp = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  row?: boolean;
};

const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  row,
}: SearchBarProp) => {
  return (
    <View
      style={{
        paddingHorizontal: wp(2),
        backgroundColor: secondary,
        borderRadius: wp(4),
        flexDirection: "row",
        alignItems: "center",
        flex: row ? 1 : 0,
      }}
    >
      <Entypo
        name="magnifying-glass"
        size={wp(4)}
        color="black"
        style={{ paddingHorizontal: wp(2) }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ""}
        placeholderTextColor={"rgba(0,0,0,0.5)"}
        style={{ fontFamily: "Gantari-Regular", fontSize: wp(4),flex:1 }}
      />
      {value.trim() && (
        <Entypo
          name="cross"
          size={24}
          color="#E6B794"
          onPress={() => (onChangeText(""))}
        />
      )}
    </View>
  );
};

export default SearchBar;
