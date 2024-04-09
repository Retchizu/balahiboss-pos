import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Button, SearchBar } from "@rneui/base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { Customer } from "../type";

type Props = {
  componentVisible: boolean;
  handleComponentVisibility: () => void;
  addComponentVisible: boolean;
  setAddComponentVisible: React.Dispatch<React.SetStateAction<boolean>>;
  customerInfo: string;
  setCustomerInfo: React.Dispatch<React.SetStateAction<string>>;
  customerName: string;
  setCustomerName: React.Dispatch<React.SetStateAction<string>>;
  addDataCustomer: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredData: () => Customer[];
  setSelected: React.Dispatch<React.SetStateAction<Customer | undefined>>;
  setButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
const SelectCustomerModalComponent = ({
  componentVisible,
  handleComponentVisibility,
  addComponentVisible,
  setAddComponentVisible,
  customerInfo,
  setCustomerInfo,
  customerName,
  setCustomerName,
  searchQuery,
  setSearchQuery,
  addDataCustomer,
  filteredData,
  setSelected,
  setButtonVisible,
}: Props) => {
  return (
    <View>
      <Modal
        visible={componentVisible}
        transparent
        animationType="slide"
        onRequestClose={handleComponentVisibility}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: wp("5%"),
            padding: wp("5%"),
            shadowColor: "#000",
            shadowOpacity: 0.2,
            elevation: wp("2%"),
            marginHorizontal: wp("2%"),
            justifyContent: "center",
          }}
        >
          {addComponentVisible ? (
            <View style={{ justifyContent: "center", flex: 1 }}>
              <Text style={styles.textStyle}>Add a Customer</Text>
              <Text style={styles.labelStyle}>Customer name:</Text>
              <TextInput
                placeholder="Customer name"
                style={styles.inputContainerStyle}
                value={customerName}
                onChangeText={(text) => {
                  setCustomerName(text);
                }}
              />
              <Text style={styles.labelStyle}>Customer Info:</Text>
              <TextInput
                placeholder="Customer Info"
                style={styles.inputContainerStyle}
                value={customerInfo}
                onChangeText={(text) => setCustomerInfo(text)}
                multiline
              />
              <View
                style={{
                  marginVertical: hp("2%"),
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                }}
              >
                <Button
                  title={"Go back"}
                  buttonStyle={{ backgroundColor: "#af71bd" }}
                  containerStyle={{
                    borderRadius: 10,
                    width: wp("30%"),
                  }}
                  onPress={() => {
                    setAddComponentVisible(false);
                  }}
                />
                <Button
                  title={"Confirm"}
                  buttonStyle={{ backgroundColor: "#af71bd" }}
                  containerStyle={{
                    borderRadius: 10,
                    width: wp("30%"),
                  }}
                  onPress={() => addDataCustomer()}
                />
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <SearchBar
                  placeholder={"Search Customer"}
                  containerStyle={{
                    backgroundColor: "white",
                    borderColor: "white",
                    flex: 1,
                  }}
                  inputStyle={{ fontSize: hp("2%") }}
                  inputContainerStyle={{ backgroundColor: "#f7f2f7" }}
                  round
                  autoCapitalize="none"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                />

                <TouchableOpacity
                  style={{
                    padding: wp("2%"),
                    marginRight: wp("2%"),
                    backgroundColor: "#f7f2f7",
                    borderRadius: wp("3%"),
                  }}
                  onPress={() => {
                    setAddComponentVisible(true);
                  }}
                >
                  <Ionicons name="person-add-sharp" size={24} color="#af71bd" />
                </TouchableOpacity>
              </View>

              <FlatList
                style={{ height: hp("90%") }}
                data={filteredData()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      borderColor: "#af71bd",
                      borderWidth: 2,
                      borderRadius: 5,
                      marginVertical: 5,
                      marginHorizontal: 10,
                    }}
                  >
                    <View>
                      <TouchableOpacity
                        onPress={() => {
                          setSelected(item);
                          handleComponentVisibility();
                          setButtonVisible(true);
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                          {item.customerName}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={{ maxWidth: "90%", fontSize: 12 }}
                        >
                          {item.customerInfo}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <View
                style={{
                  marginBottom: 10,
                  flexDirection: "row",
                }}
              >
                <Button
                  title={"Close Customer List"}
                  buttonStyle={{ backgroundColor: "#af71bd" }}
                  containerStyle={{
                    borderRadius: 10,
                    flex: 1,
                    marginHorizontal: 20,
                  }}
                  onPress={() => {
                    handleComponentVisibility();
                    setButtonVisible(true);
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default SelectCustomerModalComponent;

const styles = StyleSheet.create({
  textStyle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
    color: "#af71bd",
  },
  labelStyle: {
    marginHorizontal: 5,
    paddingHorizontal: 20,
    fontSize: 14,
  },
  inputContainerStyle: {
    borderWidth: 5,
    borderColor: "#af71bd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 50,
  },
});
