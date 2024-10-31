import {
  StyleSheet,
  Text,
  TextInputProps,
  View,
  TextInput,
  StyleProp,
  ViewStyle,
} from "react-native";
import React from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

type InputFormWithLabelProps = {
  formLabel: string;
  textInputProp: TextInputProps;
  viewStyle?: StyleProp<ViewStyle>;
};

const InputFormWithLabel: React.FC<InputFormWithLabelProps> = (props) => {
  const { formLabel, textInputProp, viewStyle } = props;
  return (
    <View style={viewStyle}>
      <Text style={styles.labelStyle}>{formLabel}: </Text>
      <View style={styles.textInputContainer}>
        <TextInput {...textInputProp} style={styles.inputStyle} />
      </View>
    </View>
  );
};

export default InputFormWithLabel;

const styles = StyleSheet.create({
  textInputContainer: {
    borderColor: "#E6B794",
    borderWidth: wp(0.3),
    paddingHorizontal: wp(1),
    borderRadius: wp(1.5),
  },
  labelStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(4.5),
  },
  inputStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    padding: wp(1),
  },
});
