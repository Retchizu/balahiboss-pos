import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import CommonButton from "@/components/buttons/CommonButton";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import { api } from "@/config/axios-api";
import FloatingButton from "@/components/buttons/FloatingButton";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Entypo, FontAwesome5 } from "@expo/vector-icons";
import { useSelectedEmployeeContext } from "@/contexts/SelectedEmployee";
import { router } from "expo-router";
import formatMillisecondsToHours from "@/methods/date/formatMilisecondsToHours";
import { useTimesheetContext } from "@/contexts/TimesheetContext";

const EmployeeDetails = () => {
  const { selectedEmployee } = useSelectedEmployeeContext();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateRangePickerVisible, setIsDateRangePickerVisible] =
    useState(false);

  const [rate, setRate] = useState("");
  const [rateModalVisible, setRateModalVisible] = useState(false);

  const { setTimesheetInfo, timesheetInfo } = useTimesheetContext();
  useEffect(() => {
    const getTimesheet = async () => {
      try {
        const response = await api.get(`/employees/timesheet/list`, {
          params: {
            uid: selectedEmployee?.uid,
            startDate,
            endDate,
          },
        });
        setTimesheetInfo({
          timesheets: response.data.timesheets,
          rate: response.data.rate,
        });
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({ type: "error", text1: error.response?.data.error });
        }
      }
    };
    getTimesheet();
  }, [endDate, selectedEmployee, setTimesheetInfo, startDate]);

  const computeTotalHoursWorked = useMemo(() => {
    if (!timesheetInfo?.timesheets) return { totalRate: 0, totalHours: 0 };

    const totalMs = timesheetInfo.timesheets.reduce(
      (acc, curr) =>
        acc +
        (curr.logoutTime
          ? new Date(curr.logoutTime).getTime() -
            new Date(curr.loginTime).getTime()
          : 0),
      0
    );

    const totalHours = totalMs / (1000 * 60 * 60);

    const totalRate = totalHours * timesheetInfo.rate;

    return { totalRate, totalHours: totalMs };
  }, [timesheetInfo?.timesheets, timesheetInfo?.rate]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(5) }}>
        Employee:
      </Text>
      <View
        style={{
          marginVertical: hp(0.5),
          borderRadius: wp(2),
          backgroundColor: secondary,
          padding: wp(2),
        }}
      >
        <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(4.5) }}>
          {selectedEmployee?.displayName}
        </Text>
      </View>

      <View
        style={{ flexDirection: "row", justifyContent: "center", gap: wp(10) }}
      >
        <CommonButton
          onPress={() => setIsDateRangePickerVisible(true)}
          title={
            startDate && endDate
              ? `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`
              : startDate
                ? format(startDate, "MMM d, yyyy") + " – ..."
                : "Select date range"
          }
          backgroundColor={"#FFDABF"}
          titleColor={"#9A3412"}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: "#9A3412",
            size: wp(5.5),
          }}
        />
      </View>
      <DateRangePickerModal
        visible={isDateRangePickerVisible}
        onClose={() => setIsDateRangePickerVisible(false)}
        onApply={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setIsDateRangePickerVisible(false);
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />

      <View
        style={{
          borderWidth: wp(0.4),
          borderRadius: wp(4),
          padding: wp(2),
          marginTop: hp(2),
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontFamily: "Gantari-Regular", fontSize: wp(4) }}>
          Hourly Rate
        </Text>
        <Text style={{ fontFamily: "Gantari-Regular", fontSize: wp(4) }}>
          ₱ {(timesheetInfo?.rate ?? 0).toFixed(2)}
        </Text>
      </View>
      <FlatList
        style={{ paddingVertical: hp(1), flex: 1 }}
        data={timesheetInfo?.timesheets ?? []}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              marginVertical: hp(0.5),
              borderRadius: wp(2),
              backgroundColor: secondary,
              padding: wp(2),
              justifyContent: "space-between",
            }}
            activeOpacity={0.7}
            onPress={() => {
              router.push({ pathname: "../edit", params: { id: item.id } });
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4) }}>
                  {format(new Date(item.date), "MMM d, yyyy")} at{" "}
                  {format(new Date(item.loginTime), "h:mm a")}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{ fontFamily: "Gantari-Regular", fontSize: wp(3.5) }}
                  >
                    {format(new Date(item.loginTime), "h:mm a")}
                  </Text>
                  <Text style={{ fontFamily: "Gantari-Regular" }}> – </Text>
                  <Text
                    style={{ fontFamily: "Gantari-Regular", fontSize: wp(3.5) }}
                  >
                    {item.logoutTime
                      ? format(new Date(item.logoutTime), "h:mm a")
                      : "On going"}
                  </Text>
                </View>
              </View>

              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>
        )}
      />
      <FloatingButton
        backgroundColor={strongPrimary}
        onPress={() => setRateModalVisible(true)}
        icon={{
          family: "FontAwesome6",
          name: "pencil",
          color: "white",
          size: wp(6),
        }}
        zIndex={1}
      />

      <View
        style={{
          padding: wp(4),
          borderRadius: wp(6),
          borderWidth: wp(0.4),
          borderColor: "black",
        }}
      >
        <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(5.5) }}>
          Total Hours:{" "}
          {formatMillisecondsToHours(computeTotalHoursWorked.totalHours)}
        </Text>
        <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(5.5) }}>
          Total Rate: ₱{computeTotalHoursWorked.totalRate.toFixed(2)}
        </Text>
      </View>
      {/* prettier Set Rate modal */}
      <ModalTemplate
        visible={rateModalVisible}
        height={hp(35)}
        width={wp(86)}
        onClose={() => setRateModalVisible(false)}
      >
        <View style={{ alignItems: "center", paddingHorizontal: wp(3) }}>
          <FontAwesome5
            name="money-bill-wave"
            size={wp(12)}
            color={strongPrimary}
            style={{ marginBottom: hp(1) }}
          />
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(5),
              textAlign: "center",
            }}
          >
            Set Hourly Rate
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(3.8),
              color: "#6B7280",
              textAlign: "center",
              marginTop: hp(0.8),
            }}
          >
            Enter new hourly rate for{" "}
            {selectedEmployee?.displayName ?? "the employee"}.
          </Text>
        </View>

        <View style={{ marginTop: hp(2), paddingHorizontal: wp(3) }}>
          <View
            style={{
              borderWidth: wp(0.35),
              borderRadius: wp(3),
              paddingHorizontal: wp(3),
              paddingVertical: hp(1),
            }}
          >
            <TextInput
              keyboardType="number-pad"
              value={rate}
              onChangeText={setRate}
              placeholder="0.00"
              style={{ fontFamily: "Gantari-Regular", fontSize: wp(4) }}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: wp(3),
            marginTop: hp(3),
          }}
        >
          <CommonButton
            title="Cancel"
            onPress={() => setRateModalVisible(false)}
            backgroundColor="#F3F4F6"
            titleColor="#111827"
            marginTop={0}
          />
          <CommonButton
            title="Set Rate"
            onPress={async () => {
              try {
                const response = await api.post("/employees/set-rate", {
                  uid: selectedEmployee?.uid,
                  rate: parseFloat(rate),
                });
                setTimesheetInfo((prev) =>
                  prev ? { ...prev, rate: parseFloat(rate) } : undefined
                );
                setRateModalVisible(false);
                Toast.show({
                  type: "success",
                  text1: `${response.data.message}`,
                });
              } catch (error) {
                if (isAxiosError(error)) {
                  Toast.show({
                    type: "error",
                    text1: `${error.response?.data.error}`,
                  });
                }
              }
            }}
            backgroundColor={strongPrimary}
            titleColor="#ffffff"
            marginTop={0}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default EmployeeDetails;
