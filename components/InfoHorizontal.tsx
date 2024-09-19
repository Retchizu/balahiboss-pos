import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type InfoHorizontalProp = {
  label: string;
  value: string;
};
const InfoHorizontal = ({ label, value }: InfoHorizontalProp) => {
  return (
    <View style={styles.rowFormat}>
      <Text style={styles.labelStyle}>{label}:</Text>
      <Text style={styles.valueStyle}>{value}</Text>
    </View>
  );
};

export default InfoHorizontal;

const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
    flex: 1,
  },
  valueStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    maxWidth: wp(70),
    flex: 1,
  },
  rowFormat: {
    flexDirection: "row",
  },
});
