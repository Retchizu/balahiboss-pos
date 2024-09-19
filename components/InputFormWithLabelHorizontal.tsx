import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type InputFormWithLabelHorizontalProps = TextInputProps & {
  formLabel: string;
};

const InputFormWithLabelHorizontal: React.FC<
  InputFormWithLabelHorizontalProps
> = (props) => {
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

export default InputFormWithLabelHorizontal;

const styles = StyleSheet.create({
  inputFormContainer: {
    marginVertical: hp(0.5),
  },
  textInputContainer: {
    borderWidth: wp(0.3),

    paddingHorizontal: wp(1),
    borderRadius: wp(1.5),
  },
  labelStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.5),
  },
});
