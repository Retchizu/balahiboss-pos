import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ButtonFormWithLabelProps = TouchableOpacityProps &
  TextProps & {
    formLabel: string;
    viewStyle?: StyleProp<ViewStyle>;
    title: string;
  };

const ButtonFormWithLabel: React.FC<ButtonFormWithLabelProps> = (props) => {
  const { formLabel, viewStyle, title, ...restProps } = props;
  const textProps: TextProps = restProps;
  const touchableOpacityProps: TouchableOpacityProps = restProps;
  return (
    <View style={viewStyle}>
      <Text style={styles.labelStyle} {...textProps}>
        {formLabel}:
      </Text>
      <TouchableOpacity
        {...touchableOpacityProps}
        style={styles.buttonStyle}
        activeOpacity={0.7}
      >
        <Text numberOfLines={1} style={styles.titleStyle}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonFormWithLabel;

const styles = StyleSheet.create({
  labelStyle: {
    flex: 1.5,
    fontFamily: "SoraMedium",
    fontSize: wp(4.5),
  },
  buttonContainerStyle: {
    flex: 2.5,
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    color: "#F3F0E9",
    fontSize: wp(4),
    textAlign: "center",
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    padding: wp(1.5),
  },
});
