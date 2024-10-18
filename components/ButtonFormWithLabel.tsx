import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { Button, ButtonProps } from "@rneui/base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ButtonFormWithLabelProps = ButtonProps &
  TextProps & {
    formLabel: string;
    viewStyle?: StyleProp<ViewStyle>;
  };

const ButtonFormWithLabel: React.FC<ButtonFormWithLabelProps> = (props) => {
  const { formLabel, viewStyle, ...restProps } = props;
  const buttonProps: ButtonProps = restProps;
  const textProps: TextProps = restProps;
  return (
    <View style={viewStyle}>
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
    fontSize: wp(3),
    height: hp(2.7),
    bottom: hp(0.5),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
  },
});
