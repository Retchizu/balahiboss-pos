import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import useCustomersArray from "@/hooks/useCustomersArray";
import { useCustomerContext } from "@/contexts/CustomerContext";
import FloatingButton from "@/components/buttons/FloatingButton";
import { router } from "expo-router";
import searchCustomerByName from "@/methods/search/searchCustomerByName";

const CustomerListScreen = () => {
  const { customers } = useCustomerContext();
  const { customerArray } = useCustomersArray(customers);

  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCustomer = searchCustomerByName(customerArray, searchQuery);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
      }}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search Customers..."
      />
      <FlatList
        data={filteredCustomer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.6)",
              marginVertical: hp(0.5),
              padding: wp(2),
              borderRadius: wp(4),
            }}
            activeOpacity={0.7}
            onPress={() => {router.navigate(`../${item.id}`)}}
          >
            <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(4) }}>
              {item.customerName}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontFamily: "Gantari-Regular", fontSize: wp(4) }}
            >
              {item.customerInfo}
            </Text>
          </TouchableOpacity>
        )}
        style={{ marginTop: hp(1) }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      />
      <FloatingButton
        onPress={() => {
          router.navigate("../add");
        }}
        icon={{ name: "plus", family: "Entypo", color: "white", size: wp(6) }}
        backgroundColor={strongPrimary}
      />
    </View>
  );
};

export default CustomerListScreen;
