import {
  StyleSheet,
  Text,
  FlatList,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ReportRootStackParamList } from "../type";
import { Foundation } from "@expo/vector-icons";

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
            color="pink"
            style={{ alignSelf: "center" }}
          />
        );
      case "expense":
        return (
          <MaterialCommunityIcons
            name="hand-coin"
            size={35}
            color="pink"
            style={{ alignSelf: "center" }}
          />
        );
      case "stock":
        return (
          <Entypo
            name="dropbox"
            size={35}
            color="pink"
            style={{ alignSelf: "center" }}
          />
        );
      case "low":
        return (
          <Foundation
            name="graph-bar"
            size={35}
            color="pink"
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
          alignItems: "center",
          marginVertical: "50%",
          marginHorizontal: 10,
        }}
      >
        {reportMenu.map((item) => (
          <View
            key={item.key}
            style={{
              marginVertical: 10,
              borderColor: "pink",
              borderWidth: 3,
              width: "100%",
            }}
          >
            <TouchableOpacity
              key={item.title}
              onPress={() => handleNavigation(item.title)}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginVertical: 10,
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                }}
              >
                {handleIcon(item.icon)}
                <Text
                  style={{
                    marginLeft: 5,
                    backgroundColor: "#f7f7f7",
                    textAlign: "center",
                    fontSize: 25,
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
