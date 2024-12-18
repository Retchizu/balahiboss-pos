import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useCallback, useEffect } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  Customer,
  InvoiceForm,
  InvoiceStackParamList,
  User,
} from "../types/type";
import { getCustomerData } from "../methods/data-methods/getCustomerData";
import Searchbar from "./Searchbar";
import AntDesign from "@expo/vector-icons/AntDesign";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast, { ToastType } from "react-native-toast-message";

type CustomerListModalProp = {
  isVisible: boolean;
  setIsVisible: () => void;
  customers: Customer[];
  setCustomerList: (newCustomerList: Customer[]) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  navigation?: NativeStackNavigationProp<
    InvoiceStackParamList,
    "InvoiceScreen"
  >;
  setInvoiceFormInfo: React.Dispatch<React.SetStateAction<InvoiceForm>>;
  user: User | null;
  setIsLoadingCustomerFetch: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingCustomerFetch: boolean;
  showToast: (type: ToastType, text1: string, text2?: string) => void;
};

const CustomerListModal = memo(
  ({
    isVisible,
    setIsVisible,
    customers,
    setCustomerList,
    searchQuery,
    setSearchQuery,
    navigation,
    setInvoiceFormInfo,
    user,
    setIsLoadingCustomerFetch,
    isLoadingCustomerFetch,
    showToast,
  }: CustomerListModalProp) => {
    useEffect(() => {
      if (!customers.length) {
        getCustomerData(
          setCustomerList,
          user,
          setIsLoadingCustomerFetch,
          showToast
        );
      }
    }, []);

    const renderCustomerList = useCallback(
      ({ item }: { item: Customer }) => (
        <TouchableOpacity
          style={styles.customerInfoContainer}
          activeOpacity={0.5}
          onPress={() => {
            setInvoiceFormInfo((prev) => ({ ...prev, customer: item }));
            setIsVisible();
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
      [customers, isVisible]
    );

    return (
      <Modal
        transparent
        visible={isVisible}
        onRequestClose={() => setIsVisible()}
      >
        <View style={styles.mainContainer}>
          <View style={styles.childContainer}>
            <View
              style={[
                styles.headerContainer,
                { paddingRight: navigation ? wp(10) : 0 },
              ]}
            >
              <Searchbar
                placeholder="Search customer..."
                onChangeText={(text) => setSearchQuery(text)}
                value={searchQuery}
                setSearchBarValue={setSearchQuery}
                searchBarValue={searchQuery}
              />
              {navigation && (
                <TouchableOpacity
                  style={{ padding: wp(2) }}
                  onPress={() => {
                    setIsVisible();
                    navigation.navigate("AddCustomerScreen", true);
                  }}
                >
                  <AntDesign name="adduser" size={24} color="#634F40" />
                </TouchableOpacity>
              )}
            </View>
            {isLoadingCustomerFetch ? (
              <ActivityIndicator
                color={"#634F40"}
                size={wp(10)}
                style={{ flex: 1 }}
              />
            ) : (
              <FlatList
                data={customers}
                renderItem={renderCustomerList}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
              />
            )}
          </View>
          <Toast position="bottom" autoHide visibilityTime={2000} />
        </View>
      </Modal>
    );
  }
);
export default CustomerListModal;

const styles = StyleSheet.create({
  mainContainer: {
    height: hp(90),
    paddingHorizontal: wp(2),
    paddingTop: hp(10),
    paddingBottom: hp(2),
  },
  childContainer: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  customerInfoContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(1),
    marginVertical: hp(0.5),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
