import {
  TouchableOpacity,
  View,
  Text,
  SectionList,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import CommonButton from "@/components/buttons/CommonButton";
import DatePicker from "react-native-date-picker";
import Activity, {
  ActivityAction,
  ActivityEntity,
  ActivityLog,
} from "@/types/Activity";
import { isAxiosError } from "axios";
import { api } from "@/config/axios-api";
import { useProductContext } from "@/contexts/ProductContext";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { useRecentTrasactionContext } from "@/contexts/RecentTransactionContext";
import { useCustomerContext } from "@/contexts/CustomerContext";

import { format, isToday } from "date-fns";
import { router } from "expo-router";
import { useActivityContext } from "@/contexts/ActivityContext";
import ModalTemplate from "@/components/modals/ModalTemplate";
import {Checkbox} from "expo-checkbox";
import Toast from "react-native-toast-message";

type Section = {
  title: string;
  data: Activity[];
};

const ActivityLogScreen = () => {
  const { activities, setActivities } = useActivityContext();

  // dependencies
  const { products } = useProductContext();
  const { transactions } = useTransactionContext();
  const { recentTransactions } = useRecentTrasactionContext();
  const { customers } = useCustomerContext();

  // startDate
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  // endDate
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  // search query
  const [searchQuery, setSearchQuery] = useState("");

  //filter
  const [filerModalVisible, setFilterModalVisible] = useState(false);

  type ActivityFilter = "Transaction" | "Product" | "Customer" | "All";
  const activityFilterOption: ActivityFilter[] = [
    "All",
    "Transaction",
    "Product",
    "Customer",
  ];
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("All");

  const filteredActivity = useMemo(() => {
    return activities.filter((a) => {
      if (activityFilter === "Product" && a.entity !== "product") return false;
      if (activityFilter === "Customer" && a.entity !== "customer")
        return false;
      if (activityFilter === "Transaction" && a.entity !== "transaction")
        return false;

      if (searchQuery.length > 0)
        return a.displayName.toLowerCase().includes(searchQuery.toLowerCase());

      return true;
    });
  }, [activities, activityFilter, searchQuery]);

  useEffect(() => {
    const getActivityLogs = async () => {
      try {
        const response = await api.get("/activity/list", {
          params: {
            startDate,
            endDate,
          },
        });
        setActivities(response.data.items);
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.show({type:"error", text1:`${error.response?.data.error}`})
        }
        console.error((error as Error).message);
      }
    };

    getActivityLogs();
  }, [
    customers,
    products,
    transactions,
    recentTransactions,
    setActivities,
    startDate,
    endDate,
  ]);

  const parseActions = (action: ActivityAction, entity: ActivityEntity) => {
    switch (action) {
      case "CREATE":
        return `created a new ${entity}`;
      case "DELETE":
        return `deleted a ${entity}`;
      case "UPDATE":
        return `updated a ${entity}`;
    }
  };

  // group activity by dates for displaying in list
  const groupActivitiesByDate = (activityLog: ActivityLog): Section[] => {
    // Convert dictionary → array
    const activities = Object.values(activityLog);

    // Sort by newest first
    const sorted = activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group into dictionary by label
    const groups: Record<string, Activity[]> = {};

    for (const activity of sorted) {
      const d = new Date(activity.date);

      const label = isToday(d) ? "Today" : format(d, "MMM d yyyy"); // e.g. "Aug 16"

      if (!groups[label]) groups[label] = [];
      groups[label].push(activity);
    }

    // Convert dictionary → SectionList format
    return Object.keys(groups).map((title) => ({
      title,
      data: groups[title],
    }));
  };

  const sections = useMemo(
    () => groupActivitiesByDate(filteredActivity),
    [filteredActivity]
  );

  // Memoize renderItem
  const renderItem = useCallback(
    ({ item }: { item: Activity }) => (
      <TouchableOpacity
        style={{
          padding: wp(2),
          borderBottomWidth: wp(0.3),
          borderColor: strongPrimary,
        }}
        activeOpacity={0.7}
        onPress={() => {
          if (item.entity === "transaction") {
            router.push({
              pathname: "../transaction",
              params: { id: item.id },
            });
          } else if (item.entity === "product") {
            router.push({
              pathname: "../product",
              params: { id: item.id },
            });
          } else if (item.entity === "customer") {
            router.push({
              pathname: "../customer",
              params: { id: item.id },
            });
          }
        }}
      >
        <Text
          style={{ fontFamily: "Gantari-Regular", fontSize: wp(4) }}
          numberOfLines={1}
        >
          {item.displayName} {parseActions(item.action, item.entity)}
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: wp(1) }}
        >
          <FontAwesome6
            name="clock-four"
            size={wp(3.5)}
            color="rgba(0,0,0,0.5)"
          />
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(3.5),
              color: "rgba(0,0,0,0.5)",
            }}
          >
            {new Date(item.date).toLocaleString("en-PH", {
              timeStyle: "short",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  // Memoize renderSectionHeader
  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <View style={{ marginTop: hp(1) }}>
        <Text
          style={{
            fontFamily: "Gantari-SemiBold",
            fontSize: wp(4.5),
            color: "rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </Text>
      </View>
    ),
    []
  );

  const renderSection = <T extends string>(
    title: string,
    options: readonly T[],
    selected: T,
    onChange: (value: T) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.option}
          onPress={() => onChange(opt)}
        >
          <Checkbox
            value={selected === opt}
            onValueChange={() => onChange(opt)}
            style={styles.checkbox}
          />
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <View style={{ flexDirection: "row", gap: wp(2) }}>
        <SearchBar
          onChangeText={setSearchQuery}
          value={searchQuery}
          placeholder="Search User"
          row
        />
        <TouchableOpacity
          style={{
            padding: wp(2),
            borderRadius: wp(4),
            backgroundColor: secondary,
          }}
        >
          <Ionicons
            name="funnel"
            size={24}
            color={"black"}
            onPress={() => setFilterModalVisible(true)}
          />
        </TouchableOpacity>
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        style={{ marginVertical: hp(1) }}
      />

      <ModalTemplate
        visible={filerModalVisible}
        onClose={() => setFilterModalVisible(false)}
        height={hp(38)}
        width={wp(90)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: wp(3),
            marginBottom: hp(1),
            paddingHorizontal: wp(1),
          }}
        >
          <Ionicons name="funnel" size={wp(7)} color={strongPrimary} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Gantari-Bold",
                fontSize: wp(4.4),
                color: "#111827",
              }}
            >
              Filters
            </Text>
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                fontSize: wp(3.4),
                color: "#6B7280",
                marginTop: hp(0.2),
              }}
            >
              Filter activity logs by category.
            </Text>
          </View>
        </View>

        <View style={{ maxHeight: hp(22), marginTop: hp(1) }}>
          <ScrollView contentContainerStyle={{ paddingBottom: hp(1) }}>
            {renderSection(
              "Filter By Category",
              activityFilterOption,
              activityFilter,
              setActivityFilter
            )}
          </ScrollView>
        </View>

        <View
          style={{
            marginTop: hp(2),
            flexDirection: "row",
            justifyContent: "space-between",
            gap: wp(3),
          }}
        >
          <CommonButton
            title="Cancel"
            onPress={() => setFilterModalVisible(false)}
            backgroundColor="#F3F4F6"
            titleColor="#111827"
            marginTop={0}
          />
          <CommonButton
            title="Apply"
            onPress={() => setFilterModalVisible(false)}
            backgroundColor={strongPrimary}
            titleColor={primary}
            marginTop={0}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default ActivityLogScreen;

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(1.5), // previously 12
  },
  sectionTitle: {
    fontFamily: "Gantari-Bold",
    fontSize: wp(3.5), // previously 14
    marginBottom: hp(0.8), // previously 6
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.8), // previously 6
  },
  checkbox: {
    marginRight: wp(2), // previously 8
  },
  optionText: {
    fontSize: wp(3.5), // previously
    fontFamily: "Gantari-Regular",
  },
});
