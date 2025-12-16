import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SegmentedButtons } from "react-native-paper";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import CommonButton from "@/components/buttons/CommonButton";
import DatePicker from "react-native-date-picker";
import { Ionicons } from "@expo/vector-icons";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Checkbox } from "expo-checkbox";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import TopCustomer from "@/types/metrics/TopCustomer";
import Input from "@/components/inputs/Input";
import MaxStock from "@/types/metrics/MaxStock";

type AnalyticsSection = "topCustomers" | "inventory";

const AnalyticsScreen = () => {
    const [section, setSection] = useState<AnalyticsSection>("inventory");

    const buttons = useMemo(
        () => [
            { value: "inventory", label: "Inventory Analytics" },
            { value: "topCustomers", label: "Top Customers" },
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
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
        useState(false);
    const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

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
            </View>

            <View style={styles.dateRow}>
                <CommonButton
                    onPress={() => setIsStartDatePickerVisible(true)}
                    title={
                        startDate
                            ? startDate.toLocaleString("en-PH", {
                                  dateStyle: "medium",
                              })
                            : "Start Date"
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
                <CommonButton
                    onPress={() => setIsEndDatePickerVisible(true)}
                    title={
                        endDate
                            ? endDate.toLocaleString("en-PH", {
                                  dateStyle: "medium",
                              })
                            : "End Date"
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

            <DatePicker
                modal
                open={isEndDatePickerVisible}
                date={endDate ?? new Date()}
                mode="date"
                onConfirm={(selectedDate) => {
                    setIsEndDatePickerVisible(false);
                    selectedDate.setHours(23, 59, 59, 999);
                    setEndDate(selectedDate);
                }}
                onCancel={() => setIsEndDatePickerVisible(false)}
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

const InventoryAnalyticsPanel = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
        useState(false);
    const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

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
            </View>

            <View style={styles.dateRow}>
                <CommonButton
                    onPress={() => setIsStartDatePickerVisible(true)}
                    title={
                        startDate
                            ? startDate.toLocaleString("en-PH", {
                                  dateStyle: "medium",
                              })
                            : "Start Date"
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
                <CommonButton
                    onPress={() => setIsEndDatePickerVisible(true)}
                    title={
                        endDate
                            ? endDate.toLocaleString("en-PH", {
                                  dateStyle: "medium",
                              })
                            : "End Date"
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

            <DatePicker
                modal
                open={isEndDatePickerVisible}
                date={endDate ?? new Date()}
                mode="date"
                onConfirm={(selectedDate) => {
                    setIsEndDatePickerVisible(false);
                    selectedDate.setHours(23, 59, 59, 999);
                    setEndDate(selectedDate);
                }}
                onCancel={() => setIsEndDatePickerVisible(false)}
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
