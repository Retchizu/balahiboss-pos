import { StyleSheet, View, TextInput, TextInputProps } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type InputFormProps = TextInputProps;
const InputForm: React.FC<InputFormProps> = (props) => {
  return (
    <View style={styles.textInputContainer}>
      <TextInput {...props} style={styles.textInputStyle} />
    </View>
  );
};

export default InputForm;

const styles = StyleSheet.create({
  textInputContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    marginVertical: hp(1),
    borderColor: "#E6B794",
  },
  textInputStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    padding: wp(1),
  },
});
