import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import { useSelectedEmployeeContext } from "@/contexts/SelectedEmployee";
import CommonButton from "@/components/buttons/CommonButton";
import DatePicker from "react-native-date-picker";
import { api } from "@/config/axios-api";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { isAxiosError } from "axios";
import formatMillisecondsToHours from "@/methods/date/formatMilisecondsToHours";

const EditTimesheet = () => {
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;

  const { selectedEmployee } = useSelectedEmployeeContext();
  // date
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
  const [loginTime, setLoginTime] = useState<Date | null>(null);
  const [isLoginTimePickerVisible, setIsLoginTimePickerVisible] =
    useState(false);

  const [logoutTime, setLogoutTime] = useState<Date | null>(null);
  const [isLogoutTimePickerVisible, setIsLogoutTimePickerVisible] =
    useState(false);

  const [reason, setReason] = useState("");

  useEffect(() => {
    const getTimesheet = async () => {
      try {
        const response = await api.get("/employee/timesheet", {
          params: {
            id: id,
          },
        });

        const {
          date,
          duration,
          loginTime,
          logoutTime,
        }: {
          date: string;
          duration: number;
          loginTime: string;
          logoutTime: string;
        } = response.data.timesheet;
        setDate(date ? new Date(date) : null);
        setLoginTime(loginTime ? new Date(loginTime) : null);
        setLogoutTime(logoutTime ? new Date(logoutTime) : null);
        setTotalHoursWorked(duration);
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({ type: "error", text1: `${error.response?.data.error}` });
        }
      }
    };
    getTimesheet();
  }, [id]);

  const reasonRef = useRef<TextInput | null>(null);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
        gap: hp(1.5),
      }}
    >
      <View>
        <Text style={styles.inputLabel}>Employee:</Text>
        <Text
          style={{
            padding: wp(2),
            borderRadius: wp(2),
            fontFamily: "Gantari-Regular",
            fontSize: wp(4),
            backgroundColor: secondary,
          }}
        >
          {selectedEmployee?.displayName}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: wp(2), alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Date:</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsDatePickerVisible(true)}
          >
            <Text
              style={{
                borderWidth: wp(0.3),
                padding: wp(2),
                borderRadius: wp(2),
                borderColor: strongPrimary,
                fontFamily: "Gantari-Regular",
                fontSize: wp(4),
              }}
            >
              {date
                ? date.toLocaleString("en-PH", {
                    dateStyle: "medium",
                  })
                : "mm/dd/yyyy"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Total Hours Worked</Text>
          <Text
            style={{
              borderWidth: wp(0.3),
              padding: wp(2),
              borderRadius: wp(2),
              borderColor: strongPrimary,
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
            }}
          >
            {formatMillisecondsToHours(totalHoursWorked)}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: wp(2), alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Time in:</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsLoginTimePickerVisible(true)}
          >
            <Text
              style={{
                borderWidth: wp(0.3),
                padding: wp(2),
                borderRadius: wp(2),
                borderColor: strongPrimary,
                fontFamily: "Gantari-Regular",
                fontSize: wp(4),
              }}
            >
              {loginTime
                ? loginTime.toLocaleString("en-PH", {
                    timeStyle: "short",
                  })
                : "mm/dd/yyyy"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>Time out:</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setIsLogoutTimePickerVisible(true);
            }}
          >
            <Text
              style={{
                borderWidth: wp(0.3),
                padding: wp(2),
                borderRadius: wp(2),
                borderColor: strongPrimary,
                fontFamily: "Gantari-Regular",
                fontSize: wp(4),
              }}
            >
              {logoutTime
                ? logoutTime.toLocaleString("en-PH", {
                    timeStyle: "short",
                  })
                : "mm/dd/yyyy"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.inputLabel}>Reason for update:</Text>
        <TouchableOpacity
          style={{
            borderColor: strongPrimary,
            borderWidth: wp(0.3),
            borderRadius: wp(2),
            padding: wp(1),
            height: hp(15),
          }}
          activeOpacity={1}
          onPress={() => reasonRef.current?.focus()}
        >
          <TextInput
            ref={reasonRef}
            value={reason}
            onChangeText={(text) => setReason(text)}
            placeholder="Enter reason for update"
            multiline
            style={{ fontFamily: "Gantari-Regular", fontSize: wp(4.5) }}
          />
        </TouchableOpacity>
      </View>

      <View style={{ gap: hp(2), marginTop: hp(2) }}>
        <CommonButton
          onPress={() => {}}
          title="Save Changes"
          backgroundColor={strongPrimary}
          titleColor={primary}
        />
        <CommonButton
          onPress={() => {}}
          title="Cancel"
          backgroundColor={primary}
          titleColor={"black"}
        />
      </View>

      <DatePicker
        modal
        open={isDatePickerVisible}
        date={date ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsDatePickerVisible(false);
          selectedDate.setHours(11, 59, 59, 999);
          setDate(selectedDate);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
      <DatePicker
        modal
        open={isLoginTimePickerVisible}
        date={date ?? new Date()}
        mode="time"
        onConfirm={(selectedDate) => {
          setIsLoginTimePickerVisible(false);
          selectedDate.setHours(11, 59, 59, 999);
          setLoginTime(selectedDate);
        }}
        onCancel={() => setIsLoginTimePickerVisible(false)}
      />
      <DatePicker
        modal
        open={isLogoutTimePickerVisible}
        date={date ?? new Date()}
        mode="time"
        onConfirm={(selectedDate) => {
          setIsLogoutTimePickerVisible(false);
          selectedDate.setHours(11, 59, 59, 999);
          setLogoutTime(selectedDate);
        }}
        onCancel={() => setIsLogoutTimePickerVisible(false)}
      />
    </View>
  );
};

export default EditTimesheet;

const styles = StyleSheet.create({
  inputLabel: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
});
