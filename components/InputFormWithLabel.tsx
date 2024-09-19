import {
  StyleSheet,
  Text,
  TextInputProps,
  View,
  TextInput,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type InputFormWithLabelProps = TextInputProps & {
  formLabel: string;
};

const InputFormWithLabel: React.FC<InputFormWithLabelProps> = (props) => {
  const { formLabel, ...textInputProps } = props;
  return (
    <View style={styles.inputFormContainer}>
      <Text style={styles.labelStyle}>{formLabel}: </Text>
      <View style={styles.textInputContainer}>
        <TextInput
          {...textInputProps}
          style={{ fontFamily: "SoraRegular", fontSize: wp(4) }}
        />
      </View>
    </View>
  );
};

export default InputFormWithLabel;

const styles = StyleSheet.create({
  inputFormContainer: {
    flexDirection: "row",
    marginVertical: hp(0.5),
    alignItems: "center",
  },
  textInputContainer: {
    borderColor: "#E6B794",
    borderWidth: wp(0.3),
    flex: 2.5,
    paddingHorizontal: wp(1),
    borderRadius: wp(1.5),
  },
  labelStyle: {
    flex: 1.5,
    fontFamily: "SoraMedium",
    fontSize: wp(3.7),
  },
});
