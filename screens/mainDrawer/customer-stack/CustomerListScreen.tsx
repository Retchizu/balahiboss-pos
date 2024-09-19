import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import Searchbar from "../../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomerList from "../../../components/CustomerList";
import { useCustomerContext } from "../../../context/CustomerContext";
import { getCustomerData } from "../../../methods/data-methods/getCustomerData";
import { filterSearchForCustomer } from "../../../methods/search-filters/fitlerSearchForCustomer";
import AntDesign from "@expo/vector-icons/AntDesign";
import { CustomerListScreenProp } from "../../../types/type";

const CustomerListScreen = ({ navigation }: CustomerListScreenProp) => {
  const { customers, setCustomerList } = useCustomerContext();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCustomerData(setCustomerList);
  }, []);

  const filteredData = filterSearchForCustomer(customers, searchQuery);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search customer..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
        <TouchableOpacity
          style={{ padding: wp(2) }}
          onPress={() => navigation.navigate("AddCustomerScreen")}
        >
          <AntDesign name="adduser" size={24} color="#634F40" />
        </TouchableOpacity>
      </View>

      <CustomerList data={filteredData} navigation={navigation} />
    </View>
  );
};

export default CustomerListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: wp(10),
  },
});
