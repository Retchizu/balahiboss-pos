import { FlatList, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { api } from "@/config/axios-api";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { User } from "@/types/User";
import SearchBar from "@/components/searchbars/SearchBar";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import { useSelectedEmployeeContext } from "@/contexts/SelectedEmployee";


const Employees = () => {
  const { primary, textOnStrongPrimary, textMuted } = useTheme();
  const [employees, setEmployees] = useState<User[]>([]);
  const {setSelectedEmployee} = useSelectedEmployeeContext()
  useEffect(() => {
    const getEmployees = async () => {
      try {
        const response = await api.get("/employees/");
        setEmployees(response.data.employees);
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({ type: "error", text1: error.response?.data.error });
        }
      }
    };

    getEmployees();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <SearchBar
        onChangeText={setSearchQuery}
        value={searchQuery}
        placeholder="Search User"
      />
      <FlatList
        style={{ paddingVertical: hp(2) }}
        data={employees}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={{
                marginVertical: hp(0.5),
                borderRadius: wp(2),
                backgroundColor: "rgba(255,255,255,0.85)",
                borderColor: textMuted,
                borderWidth: 1,
                padding: wp(2),
                justifyContent: "space-between",
              }}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedEmployee(item);
                router.push(`../details`);
              }}
            >
              <Text
                style={{
                  fontFamily: "Gantari-SemiBold",
                  fontSize: wp(4.5),
                  color: textOnStrongPrimary,
                }}
              >
                {item.displayName}
              </Text>
              <Text
                style={{
                  fontFamily: "Gantari-Medium",
                  fontSize: wp(4),
                  color: textMuted,
                }}
              >
                Rate: ₱ {item.rate.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Employees;
