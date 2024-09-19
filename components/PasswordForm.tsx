import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Entypo from "@expo/vector-icons/Entypo";

type PasswordFormProp = TextInputProps & {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const renderEyeIcon = (
  isVisible: boolean,
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
) => (
  <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
    {isVisible ? (
      <Entypo name="eye" size={24} color="#634F40" />
    ) : (
      <Entypo name="eye-with-line" size={24} color="#634F40" />
    )}
  </TouchableOpacity>
);

const PasswordForm: React.FC<PasswordFormProp> = (props) => {
  const { isVisible, setIsVisible, ...textInputProps } = props;
  return (
    <View style={styles.textInputContainer}>
      <TextInput
        {...textInputProps}
        style={styles.textInputStyle}
        secureTextEntry={!isVisible}
      />
      {renderEyeIcon(isVisible, setIsVisible)}
    </View>
  );
};

export default PasswordForm;

const styles = StyleSheet.create({
  textInputContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    marginVertical: hp(1),
    flexDirection: "row",
    alignItems: "center",
    padding: wp(1),
    borderColor: "#E6B794",
  },
  textInputStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    flex: 1,
  },
});
