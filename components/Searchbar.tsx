import { StyleSheet, View, TextInput, TextInputProps } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Entypo from "@expo/vector-icons/Entypo";

type SearchbarProps = TextInputProps & {
  setSearchBarValue: React.Dispatch<React.SetStateAction<string>>;
  searchBarValue: string;
};

const Searchbar: React.FC<SearchbarProps> = (props) => {
  const { setSearchBarValue, searchBarValue, ...textInputProp } = props;
  return (
    <View style={styles.textInputContainer}>
      <Entypo name="magnifying-glass" size={24} color="#E6B794" />
      <TextInput style={styles.textInputStyle} {...textInputProp} />
      {searchBarValue.trim() && (
        <Entypo
          name="cross"
          size={24}
          color="#E6B794"
          onPress={() => setSearchBarValue("")}
        />
      )}
    </View>
  );
};

export default Searchbar;

const styles = StyleSheet.create({
  textInputContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    marginVertical: hp(1),
    borderColor: "#E6B794",
    flexDirection: "row",
    padding: wp(1),
    alignItems: "center",
  },
  textInputStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    flex: 1,
    paddingLeft: wp(1),
  },
});
