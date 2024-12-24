import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useCallback } from "react";
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
  setCurrentCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
};

const CustomerList = ({
  data,
  navigation,
  setCurrentCustomer,
}: CustomerListProp) => {
  const renderCustomerList = useCallback(
    ({ item }: { item: Customer }) => (
      <TouchableOpacity
        style={styles.customerInfoContainer}
        activeOpacity={0.5}
        onPress={() => {
          setCurrentCustomer(item);
          navigation.navigate("CustomerInfoScreen");
        }}
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
    ),
    [data]
  );
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderCustomerList}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
};

export default memo(CustomerList);

const styles = StyleSheet.create({
  customerInfoContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(1.5),
    marginVertical: hp(0.5),
  },
});
