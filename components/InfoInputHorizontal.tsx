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
import { SalesReport } from "../types/type";

type InfoInputHorizontalProp = TextInputProps & {
  label: string;
};
const InfoInputHorizontal: React.FC<InfoInputHorizontalProp> = (props) => {
  const { label, ...textProps } = props;
  return (
    <View style={styles.rowFormat}>
      <Text style={styles.labelStyle}>{label}:</Text>
      <TextInput style={styles.valueStyle} {...textProps} />
    </View>
  );
};

export default InfoInputHorizontal;

const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
    flex: 1,
  },
  valueStyle: {
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    borderColor: "#E6B794",
    marginVertical: hp(0.5),
    padding: wp(1),
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    flex: 1,
  },
  rowFormat: {
    flexDirection: "row",
    alignItems: "center",
  },
});
