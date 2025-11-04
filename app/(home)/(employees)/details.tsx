import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-native-date-picker";
import CommonButton from "@/components/buttons/CommonButton";
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
import { Entypo } from "@expo/vector-icons";
import { useSelectedEmployeeContext } from "@/contexts/SelectedEmployee";
import { router } from "expo-router";
import formatMillisecondsToHours from "@/methods/date/formatMilisecondsToHours";
import { useTimesheetContext } from "@/contexts/TimesheetContext";

const EmployeeDetails = () => {
  const { selectedEmployee } = useSelectedEmployeeContext();
  // startDate
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  // endDate
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  const [rate, setRate] = useState("");
  const [rateModalVisible, setRateModalVisible] = useState(false);


  const {setTimesheetInfo, timesheetInfo} = useTimesheetContext();
  useEffect(() => {
    const getTimesheet = async () => {
      try {
        const response = await api.get(`/employee/timesheet/list`, {
          params: {
            uid: selectedEmployee?.uid,
            startDate,
            endDate
          },
        });
        setTimesheetInfo({
          timesheets: response.data.timesheets,
          rate: response.data.rate,
        })
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({ type: "error", text1: error.response?.data.error });
        }
      }
    };
    getTimesheet();
  }, [endDate, selectedEmployee, setTimesheetInfo, startDate, timesheetInfo]);

  const computeTotalHoursWorked = useMemo(() => {
    if (!timesheetInfo?.timesheets) return { totalRate: 0, totalHours: 0 };

    const totalMs = timesheetInfo.timesheets.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );

    const totalHours = totalMs / (1000 * 60 * 60);

    const totalRate = totalHours * timesheetInfo.rate;

    return { totalRate, totalHours: totalMs };
  }, [timesheetInfo]);

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
          onPress={() => {
            setIsStartDatePickerVisible(true);
          }}
          title={
            startDate
              ? startDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                })
              : "Start Date"
          }
          backgroundColor={strongPrimary}
          titleColor={"#9A3412"}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: "#9A3412",
            size: wp(5.5),
          }}
        />
        <CommonButton
          onPress={() => {
            setIsEndDatePickerVisible(true);
          }}
          title={
            endDate
              ? endDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                })
              : "End Date"
          }
          backgroundColor={strongPrimary}
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
                  {new Date(item.date).toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{ fontFamily: "Gantari-Regular", fontSize: wp(3.5) }}
                  >
                    {new Date(item.loginTime).toLocaleString("en-PH", {
                      timeStyle: "short",
                    })}
                  </Text>
                  <Text style={{ fontFamily: "Gantari-Regular" }}> - </Text>
                  <Text
                    style={{ fontFamily: "Gantari-Regular", fontSize: wp(3.5) }}
                  >
                    {item.logoutTime
                      ? new Date(item.logoutTime).toLocaleString("en-PH", {
                          timeStyle: "short",
                        })
                      : "On going"}
                  </Text>
                </View>
              </View>

              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>
        )}
      />
      {
        // start date picker
      }
      <DatePicker
        modal
        open={isStartDatePickerVisible}
        date={startDate ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsStartDatePickerVisible(false);
          selectedDate.setHours(0, 0, 0, 0);
          setStartDate(selectedDate);
        }}
        onCancel={() => setIsStartDatePickerVisible(false)}
      />
      {
        // end date picker
      }
      <DatePicker
        modal
        open={isEndDatePickerVisible}
        date={endDate ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsEndDatePickerVisible(false);
          selectedDate.setHours(11, 59, 59, 999);
          setEndDate(selectedDate);
        }}
        onCancel={() => setIsEndDatePickerVisible(false)}
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

      <View style={{ padding: wp(4), borderRadius: wp(6), borderWidth:wp(0.4), borderColor:"black"}}>
        <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(5.5) }}>
          Total Hours:{" "}
          {formatMillisecondsToHours(computeTotalHoursWorked.totalHours)}
        </Text>
        <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(5.5) }}>
          Total Rate: ₱{computeTotalHoursWorked.totalRate.toFixed(2)}
        </Text>
      </View>
      <ModalTemplate
        visible={rateModalVisible}
        height={hp(20)}
        width={wp(80)}
        onClose={() => setRateModalVisible(false)}
      >
        <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(5) }}>
          Set Rate
        </Text>
        <View
          style={{
            borderWidth: wp(0.4),
            borderRadius: wp(3.5),
            marginTop: hp(1),
            paddingHorizontal: hp(1),
          }}
        >
          <TextInput
            keyboardType="number-pad"
            value={rate}
            onChangeText={setRate}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            flex: 1,
            gap: wp(4),
            marginTop: hp(2),
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setRateModalVisible(false)}
          >
            <Text
              style={{
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(6),
                padding: wp(2),
              }}
            >
              No
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              try {
                const response = await api.post("/employee/set-rate", {
                  uid: selectedEmployee?.uid,
                  rate: parseFloat(rate),
                });
                setTimesheetInfo(
                  (prev) =>
                    prev
                      ? { ...prev, rate: parseFloat(rate) }
                      : undefined
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
          >
            <Text
              style={{
                color: "#ff6347",
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(6),
                padding: wp(2),
              }}
            >
              Yes
            </Text>
          </TouchableOpacity>
        </View>
      </ModalTemplate>
    </View>
  );
};

export default EmployeeDetails;
