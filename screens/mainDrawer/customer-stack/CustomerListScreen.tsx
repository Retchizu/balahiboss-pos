import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
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
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { useToastContext } from "../../../context/ToastContext";

const CustomerListScreen = ({ navigation }: CustomerListScreenProp) => {
  const { customers, setCustomerList } = useCustomerContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();

  useEffect(() => {
    getCustomerData(setCustomerList, user, setIsLoading, showToast);
  }, []);

  const filteredData = filterSearchForCustomer(customers, searchQuery);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search customer..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          setSearchBarValue={setSearchQuery}
          searchBarValue={searchQuery}
        />
        <TouchableOpacity
          style={{ padding: wp(2) }}
          onPress={() => navigation.navigate("AddCustomerScreen", false)}
        >
          <AntDesign name="adduser" size={24} color="#634F40" />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={"#634F40"} size={wp(10)} />
        </View>
      ) : (
        <>
          <CustomerList data={filteredData} navigation={navigation} />
        </>
      )}

      <Toast position="bottom" autoHide visibilityTime={2000} />
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
