import { StyleSheet, Text, TextProps, View } from "react-native";
import React from "react";
import { Button, ButtonProps } from "@rneui/base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ButtonFormWithLabelProps = ButtonProps &
  TextProps & {
    formLabel: string;
  };

const ButtonFormWithLabel: React.FC<ButtonFormWithLabelProps> = (props) => {
  const { formLabel, ...restProps } = props;
  const buttonProps: ButtonProps = restProps;
  const textProps: TextProps = restProps;
  return (
    <View style={styles.buttonFormContainer}>
      <Text style={styles.labelStyle} {...textProps}>
        {formLabel}:{" "}
      </Text>
      <Button
        {...buttonProps}
        containerStyle={styles.buttonContainerStyle}
        titleStyle={styles.titleStyle}
        buttonStyle={styles.buttonStyle}
      />
    </View>
  );
};

export default ButtonFormWithLabel;

const styles = StyleSheet.create({
  buttonFormContainer: {
    flexDirection: "row",
    marginVertical: hp(0.5),
    alignItems: "center",
  },
  labelStyle: {
    flex: 1.5,
    fontFamily: "SoraMedium",
    fontSize: wp(3.5),
  },
  buttonContainerStyle: {
    flex: 2.5,
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    color: "#F3F0E9",
    fontSize: wp(3.5),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
  },
});
