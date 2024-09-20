import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type InfoContainerHorizontalProps = {
  label: string;
  value: string;
};

const InfoContainerHorizontal = ({
  label,
  value,
}: InfoContainerHorizontalProps) => {
  return (
    <View style={styles.infoStyle}>
      <Text style={styles.labelStyle}>{label}: </Text>
      <Text style={styles.valueStyle}>{value}</Text>
    </View>
  );
};

export default InfoContainerHorizontal;

const styles = StyleSheet.create({
  infoStyle: {
    flexDirection: "row",
    marginVertical: hp(1),
  },
  labelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4.5),
  },
  valueStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4.5),
    maxWidth: wp(70),
  },
});
