import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    ScrollView,
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SegmentedButtons } from "react-native-paper";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import CommonButton from "@/components/buttons/CommonButton";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
import { Ionicons } from "@expo/vector-icons";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Checkbox } from "expo-checkbox";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import TopCustomer from "@/types/metrics/TopCustomer";
import Input from "@/components/inputs/Input";
import MaxStock from "@/types/metrics/MaxStock";
import {
    BusiestPeriodResponse,
    DayOfWeekStats,
    WeekStats,
    TimePeriodStats,
} from "@/types/metrics/BusiestPeriod";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type AnalyticsSection = "topCustomers" | "inventory" | "busiestPeriod";

const AnalyticsScreen = () => {
    const [section, setSection] = useState<AnalyticsSection>("inventory");

    const buttons = useMemo(
        () => [
            { value: "inventory", label: "Inventory" },
            { value: "topCustomers", label: "Customers" },
            { value: "busiestPeriod", label: "Period" },
        ],
        []
    );

    return (
        <View style={styles.container}>
            <View style={styles.segmentWrap}>
                <SegmentedButtons
                    value={section}
                    onValueChange={(v) => setSection(v as AnalyticsSection)}
                    buttons={buttons}
                    density="regular"
                    style={styles.segmented}
                    theme={{
                        colors: {
                            secondaryContainer: "#FF9149",
                            onSecondaryContainer: "#FFFFFF",
                        },
                    }}
                />
            </View>

            <View style={styles.content}>
                {section === "topCustomers" ? (
                    <TopCustomersPanel />
                ) : section === "busiestPeriod" ? (
                    <BusiestPeriodPanel />
                ) : (
                    <InventoryAnalyticsPanel />
                )}
            </View>
        </View>
    );
};

const TopCustomersPanel = () => {
    type SortBy = "totalPaid" | "purchaseCount";

    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);

    const [sortBy, setSortBy] = useState<SortBy>("totalPaid");
    const [limit, setLimit] = useState<number>(20);
    const [limitText, setLimitText] = useState<string>("20");
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<TopCustomer[]>([]);

    const getTopCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/analytics/top-customers", {
                params: {
                    startDate,
                    endDate,
                    sortBy,
                    limit,
                },
            });
            setItems(response.data?.items ?? []);
        } catch (error) {
            if (isAxiosError(error)) {
                const message =
                    (error.response?.data as any)?.error ??
                    (error.response?.data as any)?.message ??
                    "Failed to get top customers";
                Toast.show({ type: "error", text1: `${message}` });
            }
            console.error("Get Top Customers Failed: ", error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, sortBy, limit]);

    useEffect(() => {
        getTopCustomers();
    }, [getTopCustomers]);

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return items;
        return items.filter((c) =>
            (c.customerName ?? "")
                .toLowerCase()
                .includes(q)
        );
    }, [items, searchQuery]);

    const exportToExcel = useCallback(async () => {
        if (!filteredItems || filteredItems.length === 0) {
            Toast.show({ type: "error", text1: "No data to export" });
            return;
        }

        try {
            // Prepare data based on TopCustomer type
            const exportData = filteredItems.map((item, index) => ({
                Rank: index + 1,
                "Customer ID": item.customerId,
                "Customer Name": item.customerName ?? "Unknown customer",
                "Purchase Count": item.purchaseCount,
                "Total Paid": Number(item.totalPaid || 0).toFixed(2),
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            worksheet["!cols"] = [
                { wch: 8 }, // Rank
                { wch: 30 }, // Customer ID
                { wch: 40 }, // Customer Name
                { wch: 15 }, // Purchase Count
                { wch: 15 }, // Total Paid
            ];

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Top Customers");

            // Convert workbook to base64
            const workbookOutput = XLSX.write(workbook, {
                type: "base64",
                bookType: "xlsx",
            });

            // Generate filename with date range
            const dateRange = startDate && endDate
                ? `${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`
                : new Date().toISOString().split("T")[0];
            const fileName = `top_customers_${dateRange}`;

            // Save to device storage
            const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;
            await FileSystem.writeAsStringAsync(fileUri, workbookOutput, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Share if available
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: `Share ${fileName}.xlsx`,
                });
            }

            Toast.show({ type: "success", text1: "Export successful" });
        } catch (error) {
            Toast.show({ type: "error", text1: "Export failed" });
            console.error("Excel Export Error:", error);
        }
    }, [filteredItems, startDate, endDate]);

    const renderRow = useCallback(
        ({ item, index }: { item: TopCustomer; index: number }) => {
            const displayName = item.customerName ?? "Unknown customer";
            return (
                <View style={styles.customerRow}>
                    <View style={{ flex: 1, marginRight: wp(2) }}>
                        <Text style={styles.customerName}>
                            {index + 1}. {displayName}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Purchases: {item.purchaseCount}
                        </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.customerTotal}>
                            ₱ {Number(item.totalPaid || 0).toFixed(2)}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Sort:{" "}
                            {sortBy === "totalPaid"
                                ? "Total Paid"
                                : "Purchase Count"}
                        </Text>
                    </View>
                </View>
            );
        },
        [sortBy]
    );

    return (
        <View style={styles.panel}>
            <Text style={styles.panelTitle}>Top Customers</Text>

            <View style={{ flexDirection: "row", gap: wp(2), marginTop: hp(1) }}>
                <SearchBar
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    placeholder="Search customers..."
                    row
                />
                <TouchableOpacity
                    style={styles.funnelButton}
                    activeOpacity={0.7}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="funnel" size={24} color={"black"} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.funnelButton}
                    activeOpacity={0.7}
                    onPress={exportToExcel}
                >
                    <MaterialCommunityIcons
                        name="microsoft-excel"
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.dateRow}>
                <CommonButton
                    onPress={() => setIsDateRangePickerVisible(true)}
                    title={
                        startDate && endDate
                            ? `${startDate.toLocaleString("en-PH", { dateStyle: "medium" })} – ${endDate.toLocaleString("en-PH", { dateStyle: "medium" })}`
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
                onApply={(newStart, newEnd) => {
                    if (newStart) {
                        newStart.setHours(0, 0, 0, 0);
                        setStartDate(newStart);
                    } else {
                        setStartDate(null);
                    }
                    if (newEnd) {
                        newEnd.setHours(23, 59, 59, 999);
                        setEndDate(newEnd);
                    } else {
                        setEndDate(null);
                    }
                    setIsDateRangePickerVisible(false);
                }}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />

            <View style={{ flex: 1, marginTop: hp(1.5) }}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#FF9149" />
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>
                            No customers found.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredItems}
                        renderItem={renderRow}
                        keyExtractor={(it) => it.customerId}
                        contentContainerStyle={{ paddingBottom: hp(1) }}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={7}
                        removeClippedSubviews={true}
                    />
                )}
            </View>

            <ModalTemplate
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                height={hp(45)}
                width={wp(90)}
            >
                <View style={styles.filterHeader}>
                    <Ionicons
                        name="funnel"
                        size={wp(7)}
                        color={strongPrimary}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterTitle}>Filters</Text>
                        <Text style={styles.filterSubtitle}>
                            Sort and limit the ranking.
                        </Text>
                    </View>
                </View>

                <View style={{ marginTop: hp(1) }}>
                    <Text style={styles.sectionTitle}>Sort by</Text>

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => setSortBy("totalPaid")}
                    >
                        <Checkbox
                            value={sortBy === "totalPaid"}
                            onValueChange={() => setSortBy("totalPaid")}
                            style={styles.checkbox}
                        />
                        <Text style={styles.optionText}>Total Paid</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => setSortBy("purchaseCount")}
                    >
                        <Checkbox
                            value={sortBy === "purchaseCount"}
                            onValueChange={() => setSortBy("purchaseCount")}
                            style={styles.checkbox}
                        />
                        <Text style={styles.optionText}>Purchase Count</Text>
                    </TouchableOpacity>

                    <Text style={[styles.sectionTitle, { marginTop: hp(1.2) }]}>
                        Limit
                    </Text>
                    <Input
                        placeholder="e.g. 20"
                        value={limitText}
                        onChangeText={(text) => {
                            // keep only digits
                            const cleaned = text.replace(/[^\d]/g, "");
                            setLimitText(cleaned);
                        }}
                        inputType="numeric"
                    />
                </View>

                <View style={styles.filterActions}>
                    <CommonButton
                        title="Cancel"
                        onPress={() => {
                            setLimitText(String(limit));
                            setFilterModalVisible(false);
                        }}
                        backgroundColor="#F3F4F6"
                        titleColor="#111827"
                        marginTop={0}
                    />
                    <CommonButton
                        title="Apply"
                        onPress={() => {
                            const parsed = Number(limitText);
                            const nextLimit = Number.isFinite(parsed)
                                ? Math.min(200, Math.max(1, parsed))
                                : 20;
                            setLimit(nextLimit);
                            setLimitText(String(nextLimit));
                            setFilterModalVisible(false);
                        }}
                        backgroundColor={strongPrimary}
                        titleColor={primary}
                        marginTop={0}
                    />
                </View>
            </ModalTemplate>
        </View>
    );
};

const BusiestPeriodPanel = () => {
    type ViewFilter = "all" | "days" | "weeks" | "timePeriods";

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);

    const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BusiestPeriodResponse | null>(null);

    const viewFilterButtons = useMemo(
        () => [
            { value: "all", label: "All" },
            { value: "days", label: "Days" },
            { value: "weeks", label: "Weeks" },
            { value: "timePeriods", label: "Hours" },
        ],
        []
    );

    const getBusiestPeriod = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/analytics/busiest-period", {
                params: {
                    startDate: startDate?.toISOString().split("T")[0],
                    endDate: endDate?.toISOString().split("T")[0],
                },
            });
            setData(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                const message =
                    (error.response?.data as any)?.error ??
                    (error.response?.data as any)?.message ??
                    "Failed to get busiest period analytics";
                Toast.show({ type: "error", text1: `${message}` });
            }
            console.error("Get Busiest Period Failed: ", error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        getBusiestPeriod();
    }, [getBusiestPeriod]);

    const exportToExcel = useCallback(async () => {
        if (!data) {
            Toast.show({ type: "error", text1: "No data to export" });
            return;
        }

        try {
            // Create workbook
            const workbook = XLSX.utils.book_new();

            // Summary sheet
            const summaryData = [
                { Metric: "Total Transactions", Value: data.summary.totalTransactions },
                { Metric: "Avg Transactions Per Day", Value: data.summary.avgTransactionsPerDay.toFixed(2) },
                { Metric: "Avg Transactions Per Week", Value: data.summary.avgTransactionsPerWeek.toFixed(2) },
            ];
            if (data.range) {
                summaryData.push({ Metric: "Window Days", Value: data.range.windowDays });
                summaryData.push({ Metric: "Start Date", Value: data.range.startIso });
                summaryData.push({ Metric: "End Date", Value: data.range.endIso });
            }
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

            // Busiest Days sheet - using DayOfWeekStats type
            const daysData = data.busiestDays.map((item, index) => ({
                Rank: index + 1,
                "Day Name": item.dayName,
                "Day Number": item.dayNumber,
                "Transaction Count": item.transactionCount,
            }));
            const daysSheet = XLSX.utils.json_to_sheet(daysData);
            daysSheet["!cols"] = [
                { wch: 8 }, // Rank
                { wch: 20 }, // Day Name
                { wch: 12 }, // Day Number
                { wch: 18 }, // Transaction Count
            ];
            XLSX.utils.book_append_sheet(workbook, daysSheet, "Busiest Days");

            // Busiest Weeks sheet - using WeekStats type
            const weeksData = data.busiestWeeks.map((item, index) => ({
                Rank: index + 1,
                "Week Key": item.weekKey,
                Year: item.year,
                "Week Number": item.weekNumber,
                "Readable Date": item.readableDate,
                "Week Start": item.weekStart,
                "Week End": item.weekEnd,
                "Transaction Count": item.transactionCount,
            }));
            const weeksSheet = XLSX.utils.json_to_sheet(weeksData);
            weeksSheet["!cols"] = [
                { wch: 8 }, // Rank
                { wch: 15 }, // Week Key
                { wch: 8 }, // Year
                { wch: 12 }, // Week Number
                { wch: 25 }, // Readable Date
                { wch: 15 }, // Week Start
                { wch: 15 }, // Week End
                { wch: 18 }, // Transaction Count
            ];
            XLSX.utils.book_append_sheet(workbook, weeksSheet, "Busiest Weeks");

            // Busiest Time Periods sheet - using TimePeriodStats type
            const timePeriodsData = data.busiestTimePeriods.map((item, index) => ({
                Rank: index + 1,
                Hour: item.hour,
                "Hour Label": item.hourLabel,
                "Transaction Count": item.transactionCount,
            }));
            const timePeriodsSheet = XLSX.utils.json_to_sheet(timePeriodsData);
            timePeriodsSheet["!cols"] = [
                { wch: 8 }, // Rank
                { wch: 8 }, // Hour
                { wch: 15 }, // Hour Label
                { wch: 18 }, // Transaction Count
            ];
            XLSX.utils.book_append_sheet(workbook, timePeriodsSheet, "Busiest Time Periods");

            // Convert workbook to base64
            const workbookOutput = XLSX.write(workbook, {
                type: "base64",
                bookType: "xlsx",
            });

            // Generate filename with date range
            const dateRange = startDate && endDate
                ? `${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`
                : new Date().toISOString().split("T")[0];
            const fileName = `busiest_period_${dateRange}`;

            // Save to device storage
            const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;
            await FileSystem.writeAsStringAsync(fileUri, workbookOutput, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Share if available
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: `Share ${fileName}.xlsx`,
                });
            }

            Toast.show({ type: "success", text1: "Export successful" });
        } catch (error) {
            Toast.show({ type: "error", text1: "Export failed" });
            console.error("Excel Export Error:", error);
        }
    }, [data, startDate, endDate]);

    const renderDayRow = useCallback(
        ({ item, index }: { item: DayOfWeekStats; index: number }) => {
            return (
                <View style={styles.customerRow}>
                    <View style={{ flex: 1, marginRight: wp(2) }}>
                        <Text style={styles.customerName}>
                            {index + 1}. {item.dayName}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Day Number: {item.dayNumber}
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.customerTotal}>
                            {item.transactionCount}
                        </Text>
                        <Text style={styles.customerMeta}>Transactions</Text>
                    </View>
                </View>
            );
        },
        []
    );

    const renderWeekRow = useCallback(
        ({ item, index }: { item: WeekStats; index: number }) => {
            return (
                <View style={styles.customerRow}>
                    <View style={{ flex: 1, marginRight: wp(2) }}>
                        <Text style={styles.customerName}>
                            {index + 1}. {item.weekKey}
                        </Text>
                        <Text style={styles.customerMeta}>
                            {item.readableDate}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Year: {item.year} • Week: {item.weekNumber}
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.customerTotal}>
                            {item.transactionCount}
                        </Text>
                        <Text style={styles.customerMeta}>Transactions</Text>
                    </View>
                </View>
            );
        },
        []
    );

    const renderTimePeriodRow = useCallback(
        ({ item, index }: { item: TimePeriodStats; index: number }) => {
            return (
                <View style={styles.customerRow}>
                    <View style={{ flex: 1, marginRight: wp(2) }}>
                        <Text style={styles.customerName}>
                            {index + 1}. {item.hourLabel}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Hour: {item.hour}:00
                        </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.customerTotal}>
                            {item.transactionCount}
                        </Text>
                        <Text style={styles.customerMeta}>Transactions</Text>
                    </View>
                </View>
            );
        },
        []
    );

    return (
        <View style={styles.panel}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(0.8) }}>
                <Text style={styles.panelTitle}>Busiest Period</Text>
                {data && (
                    <TouchableOpacity
                        style={styles.funnelButton}
                        activeOpacity={0.7}
                        onPress={exportToExcel}
                    >
                        <MaterialCommunityIcons
                            name="microsoft-excel"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.dateRow}>
                <CommonButton
                    onPress={() => setIsDateRangePickerVisible(true)}
                    title={
                        startDate && endDate
                            ? `${startDate.toLocaleString("en-PH", { dateStyle: "medium" })} – ${endDate.toLocaleString("en-PH", { dateStyle: "medium" })}`
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
                onApply={(newStart, newEnd) => {
                    if (newStart) {
                        newStart.setHours(0, 0, 0, 0);
                        setStartDate(newStart);
                    } else {
                        setStartDate(null);
                    }
                    if (newEnd) {
                        newEnd.setHours(23, 59, 59, 999);
                        setEndDate(newEnd);
                    } else {
                        setEndDate(null);
                    }
                    setIsDateRangePickerVisible(false);
                }}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />

            {data && (
                <View style={[styles.segmentWrap, { marginTop: hp(1) }]}>
                    <SegmentedButtons
                        value={viewFilter}
                        onValueChange={(v: string) => setViewFilter(v as ViewFilter)}
                        buttons={viewFilterButtons}
                        density="regular"
                        style={styles.segmented}
                        theme={{
                            colors: {
                                secondaryContainer: "#FF9149",
                                onSecondaryContainer: "#FFFFFF",
                            },
                        }}
                    />
                </View>
            )}

            <View style={{ flex: 1, marginTop: hp(1.5) }}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#FF9149" />
                    </View>
                ) : !data ? (
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>
                            No data available. Select date range.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: hp(1) }}
                        showsVerticalScrollIndicator={true}
                    >
                        {/* Summary Section - Always visible */}
                        <View
                            style={{
                                backgroundColor: "rgba(255,255,255,0.85)",
                                padding: wp(4),
                                borderRadius: wp(4),
                                marginBottom: hp(1.5),
                                borderWidth: 1,
                                borderColor: "rgba(0,0,0,0.06)",
                            }}
                        >
                            <Text
                                style={[
                                    styles.panelTitle,
                                    { marginBottom: hp(1) },
                                ]}
                            >
                                Summary
                            </Text>
                            <Text style={styles.customerMeta}>
                                Total Transactions:{" "}
                                <Text style={styles.customerName}>
                                    {data.summary.totalTransactions}
                                </Text>
                            </Text>
                            <Text style={styles.customerMeta}>
                                Avg per Day:{" "}
                                <Text style={styles.customerName}>
                                    {data.summary.avgTransactionsPerDay.toFixed(2)}
                                </Text>
                            </Text>
                            <Text style={styles.customerMeta}>
                                Avg per Week:{" "}
                                <Text style={styles.customerName}>
                                    {data.summary.avgTransactionsPerWeek.toFixed(2)}
                                </Text>
                            </Text>
                            {data.range && (
                                <Text style={styles.customerMeta}>
                                    Window:{" "}
                                    <Text style={styles.customerName}>
                                        {data.range.windowDays} days
                                    </Text>
                                </Text>
                            )}
                        </View>

                        {/* Busiest Days Section */}
                        {(viewFilter === "all" || viewFilter === "days") && (
                            <View style={{ marginBottom: hp(1.5) }}>
                                <Text
                                    style={[
                                        styles.panelTitle,
                                        { marginBottom: hp(0.8) },
                                    ]}
                                >
                                    Busiest Days
                                </Text>
                                {data.busiestDays.map((day, idx) => (
                                    <View key={day.dayNumber}>
                                        {renderDayRow({ item: day, index: idx })}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Busiest Weeks Section */}
                        {(viewFilter === "all" || viewFilter === "weeks") && (
                            <View style={{ marginBottom: hp(1.5) }}>
                                <Text
                                    style={[
                                        styles.panelTitle,
                                        { marginBottom: hp(0.8) },
                                    ]}
                                >
                                    Busiest Weeks
                                </Text>
                                {data.busiestWeeks.map((week, idx) => (
                                    <View key={week.weekKey}>
                                        {renderWeekRow({ item: week, index: idx })}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Busiest Time Periods Section */}
                        {(viewFilter === "all" || viewFilter === "timePeriods") && (
                            <View style={{ marginBottom: hp(1) }}>
                                <Text
                                    style={[
                                        styles.panelTitle,
                                        { marginBottom: hp(0.8) },
                                    ]}
                                >
                                    Busiest Time Periods
                                </Text>
                                {data.busiestTimePeriods.map((period, idx) => (
                                    <View key={period.hour}>
                                        {renderTimePeriodRow({
                                            item: period,
                                            index: idx,
                                        })}
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

const InventoryAnalyticsPanel = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);

    const [targetCoverDays, setTargetCoverDays] = useState<number>(14);
    const [targetCoverDaysText, setTargetCoverDaysText] = useState<string>("14");
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<MaxStock[]>([]);

    const getProductMaxStock = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/analytics/product-max-stock", {
                params: {
                    startDate,
                    endDate,
                    targetCoverDays,
                },
            });
            setItems(response.data?.items ?? []);
        } catch (error) {
            if (isAxiosError(error)) {
                const message =
                    (error.response?.data as any)?.error ??
                    (error.response?.data as any)?.message ??
                    "Failed to get product max stock metrics";
                Toast.show({ type: "error", text1: `${message}` });
            }
            console.error("Get Product Max Stock Failed: ", error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, targetCoverDays]);

    useEffect(() => {
        getProductMaxStock();
    }, [getProductMaxStock]);

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return items;
        return items.filter((p) =>
            (p.productName ?? "").toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    const exportToExcel = useCallback(async () => {
        if (!filteredItems || filteredItems.length === 0) {
            Toast.show({ type: "error", text1: "No data to export" });
            return;
        }

        try {
            // Prepare data based on MaxStock type
            const exportData = filteredItems.map((item, index) => ({
                Rank: index + 1,
                "Product ID": item.productId,
                "Product Name": item.productName ?? "Unknown product",
                Stock: typeof item.stock === "number" ? item.stock : "Unknown",
                "Units Sold": item.unitsSold,
                "Window Days": item.windowDays,
                "Avg Daily Units": Number(item.avgDailyUnits || 0).toFixed(2),
                "Target Cover Days": item.targetCoverDays,
                "Max Stock Level": item.maxStockLevel,
                "Suggested Order Qty": item.suggestedOrderQty,
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            worksheet["!cols"] = [
                { wch: 8 }, // Rank
                { wch: 30 }, // Product ID
                { wch: 40 }, // Product Name
                { wch: 12 }, // Stock
                { wch: 12 }, // Units Sold
                { wch: 12 }, // Window Days
                { wch: 15 }, // Avg Daily Units
                { wch: 15 }, // Target Cover Days
                { wch: 15 }, // Max Stock Level
                { wch: 18 }, // Suggested Order Qty
            ];

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Analytics");

            // Convert workbook to base64
            const workbookOutput = XLSX.write(workbook, {
                type: "base64",
                bookType: "xlsx",
            });

            // Generate filename with date range
            const dateRange = startDate && endDate
                ? `${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`
                : new Date().toISOString().split("T")[0];
            const fileName = `inventory_analytics_${dateRange}`;

            // Save to device storage
            const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;
            await FileSystem.writeAsStringAsync(fileUri, workbookOutput, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Share if available
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: `Share ${fileName}.xlsx`,
                });
            }

            Toast.show({ type: "success", text1: "Export successful" });
        } catch (error) {
            Toast.show({ type: "error", text1: "Export failed" });
            console.error("Excel Export Error:", error);
        }
    }, [filteredItems, startDate, endDate]);

    const renderRow = useCallback(
        ({ item, index }: { item: MaxStock; index: number }) => {
            const displayName = item.productName ?? "Unknown product";
            const suggested = Number(item.suggestedOrderQty || 0);
            const stock = item.stock;

            return (
                <View style={styles.customerRow}>
                    <View style={{ flex: 1, marginRight: wp(2) }}>
                        <Text style={styles.customerName}>
                            {index + 1}. {displayName}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Stock:{" "}
                            {typeof stock === "number" ? stock : "Unknown"} • Max
                            Level: {item.maxStockLevel} • Sold: {item.unitsSold}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Avg/day: {Number(item.avgDailyUnits || 0).toFixed(2)}{" "}
                            • Window: {item.windowDays}d • Cover:{" "}
                            {item.targetCoverDays}d
                        </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                        <Text
                            style={[
                                styles.customerTotal,
                                {
                                    color:
                                        suggested > 0
                                            ? "rgba(0,0,0,0.9)"
                                            : "rgba(0,0,0,0.55)",
                                },
                            ]}
                        >
                            Buy: {suggested}
                        </Text>
                        <Text style={styles.customerMeta}>
                            Suggested order qty
                        </Text>
                    </View>
                </View>
            );
        },
        []
    );

    return (
        <View style={styles.panel}>
            <Text style={styles.panelTitle}>Inventory Analytics</Text>

            <View style={{ flexDirection: "row", gap: wp(2), marginTop: hp(1) }}>
                <SearchBar
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    placeholder="Search products..."
                    row
                />
                <TouchableOpacity
                    style={styles.funnelButton}
                    activeOpacity={0.7}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="funnel" size={24} color={"black"} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.funnelButton}
                    activeOpacity={0.7}
                    onPress={exportToExcel}
                >
                    <MaterialCommunityIcons
                        name="microsoft-excel"
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.dateRow}>
                <CommonButton
                    onPress={() => setIsDateRangePickerVisible(true)}
                    title={
                        startDate && endDate
                            ? `${startDate.toLocaleString("en-PH", { dateStyle: "medium" })} – ${endDate.toLocaleString("en-PH", { dateStyle: "medium" })}`
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
                onApply={(newStart, newEnd) => {
                    if (newStart) {
                        newStart.setHours(0, 0, 0, 0);
                        setStartDate(newStart);
                    } else {
                        setStartDate(null);
                    }
                    if (newEnd) {
                        newEnd.setHours(23, 59, 59, 999);
                        setEndDate(newEnd);
                    } else {
                        setEndDate(null);
                    }
                    setIsDateRangePickerVisible(false);
                }}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />

            <View style={{ flex: 1, marginTop: hp(1.5) }}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#FF9149" />
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>
                            No products found.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredItems}
                        renderItem={renderRow}
                        keyExtractor={(it) => it.productId}
                        contentContainerStyle={{ paddingBottom: hp(1) }}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={7}
                        removeClippedSubviews={true}
                    />
                )}
            </View>

            <ModalTemplate
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                height={hp(35)}
                width={wp(90)}
            >
                <View style={styles.filterHeader}>
                    <Ionicons
                        name="funnel"
                        size={wp(7)}
                        color={strongPrimary}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterTitle}>Filters</Text>
                        <Text style={styles.filterSubtitle}>
                            Adjust target cover days.
                        </Text>
                    </View>
                </View>

                <View style={{ marginTop: hp(1) }}>
                    <Text style={styles.sectionTitle}>Target cover days</Text>
                    <Input
                        placeholder="e.g. 14"
                        value={targetCoverDaysText}
                        onChangeText={(text) => {
                            const cleaned = text.replace(/[^\d]/g, "");
                            setTargetCoverDaysText(cleaned);
                        }}
                        inputType="numeric"
                    />
                </View>

                <View style={styles.filterActions}>
                    <CommonButton
                        title="Cancel"
                        onPress={() => {
                            setTargetCoverDaysText(String(targetCoverDays));
                            setFilterModalVisible(false);
                        }}
                        backgroundColor="#F3F4F6"
                        titleColor="#111827"
                        marginTop={0}
                    />
                    <CommonButton
                        title="Apply"
                        onPress={() => {
                            const parsed = Number(targetCoverDaysText);
                            const next =
                                Number.isFinite(parsed) && parsed >= 0
                                    ? Math.min(365, parsed)
                                    : 14;
                            setTargetCoverDays(next);
                            setTargetCoverDaysText(String(next));
                            setFilterModalVisible(false);
                        }}
                        backgroundColor={strongPrimary}
                        titleColor={primary}
                        marginTop={0}
                    />
                </View>
            </ModalTemplate>
        </View>
    );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: primary,
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
    },
    title: {
        fontFamily: "Gantari-SemiBold",
        fontSize: wp(6),
        color: "rgba(0,0,0,0.85)",
        marginBottom: hp(1.5),
    },
    segmentWrap: {
        backgroundColor: "rgba(255,255,255,0.55)",
        padding: wp(2),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },
    segmented: {
        backgroundColor: "transparent",
    },
    content: {
        flex: 1,
        marginTop: hp(2),
    },
    panel: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        borderRadius: wp(3),
        padding: wp(4),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },
    panelTitle: {
        fontFamily: "Gantari-SemiBold",
        fontSize: wp(5),
        color: strongPrimary,
        marginBottom: hp(0.8),
    },
    panelBody: {
        fontFamily: "Gantari-Regular",
        fontSize: wp(4),
        color: "rgba(0,0,0,0.75)",
        lineHeight: wp(6),
    },
    funnelButton: {
        padding: wp(2),
        borderRadius: wp(4),
        backgroundColor: secondary,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        justifyContent: "center",
        alignItems: "center",
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: wp(6),
        marginTop: hp(0.4),
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp(1),
    },
    emptyText: {
        fontFamily: "Gantari-Regular",
        fontSize: wp(4),
        color: "#6B7280",
    },
    customerRow: {
        flexDirection: "row",
        padding: wp(4),
        backgroundColor: "rgba(255,255,255,0.85)",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: hp(0.5),
        borderRadius: wp(4),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },
    customerName: {
        fontFamily: "Gantari-SemiBold",
        fontSize: wp(4.3),
        color: "rgba(0,0,0,0.85)",
    },
    customerTotal: {
        fontFamily: "Gantari-SemiBold",
        fontSize: wp(4.3),
        color: "rgba(0,0,0,0.9)",
    },
    customerMeta: {
        marginTop: hp(0.2),
        fontFamily: "Gantari-Regular",
        fontSize: wp(3.3),
        color: "rgba(0,0,0,0.55)",
    },
    filterHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        marginBottom: hp(1),
        paddingHorizontal: wp(1),
    },
    filterTitle: {
        fontFamily: "Gantari-Bold",
        fontSize: wp(4.4),
        color: "#111827",
    },
    filterSubtitle: {
        fontFamily: "Gantari-Regular",
        fontSize: wp(3.4),
        color: "#6B7280",
        marginTop: hp(0.2),
    },
    sectionTitle: {
        fontFamily: "Gantari-Bold",
        fontSize: wp(3.5),
        marginBottom: hp(0.8),
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(0.8),
    },
    checkbox: {
        marginRight: wp(2),
    },
    optionText: {
        fontSize: wp(3.5),
        fontFamily: "Gantari-Regular",
    },
    filterActions: {
        marginTop: hp(2),
        flexDirection: "row",
        justifyContent: "space-between",
        gap: wp(3),
    },
});
