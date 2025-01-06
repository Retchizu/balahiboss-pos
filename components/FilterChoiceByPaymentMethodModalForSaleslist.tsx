import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { PaymentMethodFilter } from "../types/type";
import { chooseFilterTypeWithPaymentMethodForSaleslist } from "../methods/search-filters/chooseFilterTypeWIthPaymentMethodForSaleslist";

type FilterChoiceByPaymentMethodModalForSaleslistProp = {
  isFilterModalVisible: boolean;
  setIsFilterModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  paymentMethodForFilter: PaymentMethodFilter;
  setPaymentMethodForFilter: React.Dispatch<
    React.SetStateAction<PaymentMethodFilter>
  >;
  choices: { key: number; choiceName: string }[];
};

const FilterChoiceByPaymentMethodModalForSaleslist = ({
  isFilterModalVisible,
  setIsFilterModalVisible,
  choices,
  paymentMethodForFilter,
  setPaymentMethodForFilter,
}: FilterChoiceByPaymentMethodModalForSaleslistProp) => {
  return (
    <Modal
      visible={isFilterModalVisible}
      transparent
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <View
        style={{
          flex: 1,
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        <View style={styles.childContainer}>
          <Entypo
            name="cross"
            size={32}
            color="#634F40"
            style={{
              marginTop: hp(1),
              alignSelf: "flex-end",
              paddingRight: wp(2),
              paddingBottom: hp(1),
            }}
            onPress={() => setIsFilterModalVisible(false)}
          />
          <Text style={styles.modalTitle}>Sales Report filters by:</Text>
          {choices.map((item) => (
            <View key={item.key} style={styles.choiceBorder}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onPress={() =>
                  chooseFilterTypeWithPaymentMethodForSaleslist(
                    item.key,
                    setPaymentMethodForFilter
                  )
                }
              >
                <Text style={styles.choiceTitle}>{item.choiceName}</Text>
                {paymentMethodForFilter === "cash" && item.key == 1 ? (
                  <AntDesign name="check" size={24} color="#634F40" />
                ) : null}
                {paymentMethodForFilter === "online" && item.key == 2 ? (
                  <AntDesign name="check" size={24} color="#634F40" />
                ) : null}
                {paymentMethodForFilter === "none" && item.key == 3 ? (
                  <AntDesign name="check" size={24} color="#634F40" />
                ) : null}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default FilterChoiceByPaymentMethodModalForSaleslist;

const styles = StyleSheet.create({
  choiceBorder: {
    marginHorizontal: wp(3),
    marginVertical: hp(1),
    borderBottomColor: "#634F40",
    borderBottomWidth: wp(0.2),
  },
  modalTitle: {
    marginHorizontal: wp(3),
    fontSize: wp(5.5),
    marginBottom: hp(2),
    fontFamily: "SoraSemiBold",
  },
  choiceTitle: {
    fontFamily: "SoraRegular",
    fontSize: wp(5.5),
  },
  childContainer: {
    backgroundColor: "#F3F0E9",
    height: hp(35),
    width: wp(70),
    borderRadius: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
