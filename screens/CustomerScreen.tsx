import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";

import ListComponent from "../components/ListComponent";
import { Customer, CustomerRootStackParamList } from "../type";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useCustomerContext } from "../context/customerContext";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = BottomTabScreenProps<CustomerRootStackParamList, "CustomerScreen">;

const CustomerScreen = ({ navigation }: Props) => {
  const { customers, setCustomerList } = useCustomerContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Customer[]>([]);
  const user = auth.currentUser;

  const filteredData = useMemo(() => {
    const filteredItems = data.filter((item) =>
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.customerName.toString().localeCompare(b.customerName.toString())
    );
    return sortedFilteredItems;
  }, [data, searchQuery]);

  const deleteData = async (customerId: String) => {
    try {
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("customers")
        .doc(customerId.toString())
        .delete();

      const updatedData = data.filter((item) => item.id !== customerId);
      setData(updatedData);
      setCustomerList(updatedData);
      Toast.show("Customer deleted successfully", Toast.SHORT);
    } catch (error) {
      console.error("Error deleting product:", error);
      Toast.show("Error deleting customer", Toast.SHORT);
    }
  };

  useEffect(() => {
    setData(customers);
  }, [customers]);

  return (
    <SafeAreaView style={{ backgroundColor: "#f7f7f7", flex: 1 }}>
      <ListComponent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        navigation={navigation}
        placeholder="Search Customer"
        identifier="customer"
        navigateTo="AddCustomerScreen"
      />
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              paddingHorizontal: wp("2%"),
              paddingVertical: hp("1%"),
              borderColor: "#af71bd",
              borderWidth: wp("1%"),
              borderRadius: wp("2%"),
              marginVertical: hp("0.5%"),
              marginHorizontal: wp("2%"),
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ConfigureCustomerScreen", { item })
                  }
                >
                  <Text
                    style={{
                      fontSize: hp("2%"),
                      fontWeight: "bold",
                      maxWidth: wp("80%"),
                    }}
                  >
                    {item.customerName}
                  </Text>

                  <Text numberOfLines={1} style={{ maxWidth: wp("90%") }}>
                    {item.customerInfo}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ alignSelf: "center" }}
                onPress={() => deleteData(item.id)}
              >
                <Feather name="trash-2" size={30} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CustomerScreen;

const styles = StyleSheet.create({});
