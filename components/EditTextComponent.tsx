import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = {
  inputLabel: string;
  placeholder: string;
  value: string;
  setValue: (value: React.SetStateAction<string>) => void;
  keyboardType?: KeyboardTypeOptions;
};
const EditTextComponent = ({
  inputLabel,
  placeholder,
  value,
  setValue,
  keyboardType,
}: Props) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp("2%"),
      }}
    >
      <Text style={{ fontSize: hp("2.3%") }}>{inputLabel}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => setValue(text)}
        style={{ fontSize: hp("2.3%"), borderBottomWidth: wp("0.3%"), flex: 1 }}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default EditTextComponent;

const styles = StyleSheet.create({});
