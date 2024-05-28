import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Entypo,
  Ionicons,
} from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ReportRootStackParamList } from "../type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = BottomTabScreenProps<ReportRootStackParamList, "ReportScreen">;
const ReportScreen = ({ navigation }: Props) => {
  const reportMenu = [
    {
      key: 1,
      title: "Sales Report",
      icon: "sales",
    },
    {
      key: 2,
      title: "Expense Tracker and Report",
      icon: "expense",
    },
    {
      key: 3,
      title: "Stock Report",
      icon: "stock",
    },
    {
      key: 4,
      title: "Low Stock Report",
      icon: "low",
    },
  ];

  const handleIcon = (itemIcon: string) => {
    switch (itemIcon) {
      case "sales":
        return (
          <FontAwesome
            name="money"
            size={35}
            color="#5f0573"
            style={{ alignSelf: "center" }}
          />
        );
      case "expense":
        return (
          <MaterialCommunityIcons
            name="hand-coin"
            size={35}
            color="#5f0573"
            style={{ alignSelf: "center" }}
          />
        );
      case "stock":
        return (
          <Entypo
            name="dropbox"
            size={wp(10)}
            color="#5f0573"
            style={{ alignSelf: "center" }}
          />
        );
      case "low":
        return (
          <Ionicons
            name="trending-down-outline"
            size={35}
            color="#5f0573"
            style={{ alignSelf: "center" }}
          />
        );
    }
  };

  const handleNavigation = (itemTitle: string) => {
    switch (itemTitle) {
      case "Sales Report":
        navigation.navigate("SalesReportScreen");
        break;
      case "Expense Tracker and Report":
        navigation.navigate("Expenses");
        break;
      case "Stock Report":
        navigation.navigate("StockReportScreen");
        break;
      case "Low Stock Report":
        navigation.navigate("LowStockReportScreen");
        break;
    }
  };
  return (
    <SafeAreaView style={{ backgroundColor: "#f7f7f7", flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          marginHorizontal: wp(1),
        }}
      >
        <Image
          source={require("../assets/buybuysassitransparent.png")}
          style={{ height: hp(25), width: wp(70), alignSelf: "center" }}
        />
        {reportMenu.map((item) => (
          <View
            key={item.key}
            style={{
              marginVertical: 10,
              borderColor: "#af71bd",
              borderWidth: 3,
              borderRadius: wp(3),
            }}
          >
            <TouchableOpacity
              key={item.title}
              onPress={() => handleNavigation(item.title)}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: hp(2),
                  paddingHorizontal: wp(2),
                  alignItems: "center",
                }}
              >
                {handleIcon(item.icon)}
                <Text
                  style={{
                    marginLeft: 5,
                    backgroundColor: "#f7f7f7",
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "600",
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({});
