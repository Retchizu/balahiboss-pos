import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Customer, CustomerStackParamList } from "../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type CustomerListProp = {
  data: Customer[];
  navigation: NativeStackNavigationProp<
    CustomerStackParamList,
    "CustomerListScreen"
  >;
};

const CustomerList = ({ data, navigation }: CustomerListProp) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.customerInfoContainer}
            activeOpacity={0.5}
            onPress={() => navigation.navigate("CustomerInfoScreen", item)}
          >
            <Text
              numberOfLines={1}
              style={{ fontFamily: "SoraSemiBold", fontSize: wp(5) }}
            >
              {item.customerName}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontFamily: "SoraLight", fontSize: wp(3) }}
            >
              {item.customerInfo}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default CustomerList;

const styles = StyleSheet.create({
  customerInfoContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(1),
    marginVertical: hp(0.5),
  },
});
