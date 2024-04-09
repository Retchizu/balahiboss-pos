import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp } from "@react-navigation/native";
import { CustomerRootStackParamList } from "../type";
import { useCustomerContext } from "../context/customerContext";
import { auth, db } from "../firebaseconfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvilIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/base";
type ConfigureCustomerProps = {
  route: RouteProp<CustomerRootStackParamList, "ConfigureCustomerScreen">;
};
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type CustomerInfoItem = {
  key: String;
  label: String;
  value: String;
};
const ConfigureCustomerScreen: React.FC<ConfigureCustomerProps> = ({
  route,
}: ConfigureCustomerProps) => {
  const { item } = route.params;
  const [customerName, setCustomerName] = useState(item.customerName);
  const [customerInfo, setCustomerInfo] = useState(item.customerInfo);
  const [isVisible, setIsVisible] = useState(false);
  const { updateCustomer, addCustomer, customers } = useCustomerContext();
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerInfo, setEditCustomerInfo] = useState("");

  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    if (!customers.find((customer) => customer.id === item.id)) {
      addCustomer(item);
    }
  }, []);
  //selected data
  const customerData: CustomerInfoItem[] = [
    { key: "customerName", label: "Customer name", value: customerName },
    {
      key: "customerInfo",
      label: "Customer information",
      value: customerInfo,
    },
  ];

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const updateAttribute = async () => {
    updateCustomer(item.id, {
      customerName: editCustomerName,
      customerInfo: editCustomerInfo,
    });

    if (user) {
      const docRef = db
        .collection("users")
        .doc(user.uid)
        .collection("customers")
        .doc(item.id.toString());
      await docRef.update({
        customerName: editCustomerName,
        customerInfo: editCustomerInfo,
      });
    }

    setCustomerName(editCustomerName);
    setCustomerInfo(editCustomerInfo);
    toggleModal();
  };

  const handleEditPress = () => {
    toggleModal();
    setEditCustomerName(item.customerName.toString());
    setEditCustomerInfo(item.customerInfo.toString());
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f7f7f7",
        opacity: isVisible ? 0.1 : 1,
      }}
    >
      {customerData.map((item) => (
        <View
          style={{
            justifyContent: "space-between",
            borderBottomWidth: 2,
            borderBottomColor: "gray",
          }}
          key={item.key.toString()}
        >
          <Text
            style={[
              styles.infoStyle,
              { textAlign: "center", fontWeight: "500" },
            ]}
          >
            {item.label}
          </Text>
          <Text style={styles.infoStyle}>{item.value}</Text>

          <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={toggleModal}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: wp("20%"),
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: wp("5%"),
                  padding: wp("5%"),
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  elevation: wp("2%"),
                }}
              >
                <Text style={{ fontSize: hp("2.3%"), fontWeight: "500" }}>
                  Edit Customer
                </Text>
                <View
                  style={{
                    backgroundColor: "white",
                    marginTop: hp("2%"),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: hp("2.3%") }}>Customer Name:</Text>
                    <TextInput
                      style={{
                        width: wp("40%"),
                        borderBottomWidth: wp("0.1%"),
                        marginLeft: wp("2%"),
                        fontSize: hp("2.3%"),
                        borderColor: "gray",
                      }}
                      value={editCustomerName}
                      onChangeText={(text) => setEditCustomerName(text)}
                    />
                  </View>
                  <View style={{}}>
                    <Text style={{ fontSize: hp("2.3%") }}>
                      Customer information:
                    </Text>
                    <View
                      style={{
                        borderWidth: wp("0.1%"),
                        height: hp("10%"),
                      }}
                    >
                      <TextInput
                        style={{
                          width: wp("40%"),
                          marginLeft: wp("2%"),
                          fontSize: hp("2.3%"),
                        }}
                        multiline
                        value={editCustomerInfo}
                        onChangeText={(text) => setEditCustomerInfo(text)}
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: hp("5%"),
                  }}
                >
                  <TouchableOpacity
                    onPress={toggleModal}
                    style={{ marginRight: wp("5%") }}
                  >
                    <Text style={{ fontSize: hp("2%"), color: "blue" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={updateAttribute}>
                    <Text style={{ fontSize: hp("2%"), color: "blue" }}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      ))}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginTop: hp(45),
        }}
      >
        <Button
          title={"Go Back"}
          onPress={navigation.goBack}
          buttonStyle={{
            backgroundColor: "#af71bd",
            borderRadius: wp(3),
            width: wp(30),
          }}
        />
        <Button
          title={"Edit Customer"}
          onPress={handleEditPress}
          buttonStyle={{
            backgroundColor: "#af71bd",
            borderRadius: wp(3),
            width: wp(30),
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ConfigureCustomerScreen;

const styles = StyleSheet.create({
  infoStyle: {
    fontSize: 20,
    marginHorizontal: wp(3),
    marginVertical: hp(1),
  },

  customerNameHeight: {
    maxHeight: "55%",
  },

  customerInfoHeight: {
    maxHeight: "70%",
  },
});
