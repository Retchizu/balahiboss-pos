import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useBluetoothPrinter from "@/hooks/useBluetoothPrinter";
import CommonButton from "@/components/buttons/CommonButton";
import {
    BluetoothManager,
    Device,
} from "@brooons/react-native-bluetooth-escpos-printer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const PrinterConfigScreen = () => {
    const { primary, secondary, strongPrimary, textOnPrimary, textMuted } = useTheme();
    const { foundDevices, pairedDevices, scanDevices, pairDevice } =
        useBluetoothPrinter();
    const [initialLoading, setInitialLoading] = useState(false);
    const [currentPrinter, setCurrentPrinter] = useState<Device | null>(null);
    const [isSavingCurrentPrinter, setIsSavingCurrentPrinter] = useState(false);
    const [isRemovingCurrentPrinter, setIsRemovingCurrentPrinter] =
        useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const getSavedCurrentPrinter = async () => {
            try {
                setInitialLoading(true);
                const savedCurrentPrinter = await AsyncStorage.getItem(
                    "printer"
                );
                if (savedCurrentPrinter) {
                    const printer = JSON.parse(savedCurrentPrinter);
                    setCurrentPrinter(printer);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setInitialLoading(false);
            }
        };

        getSavedCurrentPrinter();
    }, []);

    useEffect(() => {
        const showAvailableDevices = async () => {
            try {
                setIsScanning(true);
                await scanDevices();
            } catch (error) {
                console.error(error);
            } finally {
                setIsScanning(false);
            }
        };

        showAvailableDevices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveCurrentPrinter = async (device: Device) => {
        try {
            setIsSavingCurrentPrinter(true);
            await AsyncStorage.setItem("printer", JSON.stringify(device));
            setCurrentPrinter(device);
            console.log("Current Printer Set Successfully");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingCurrentPrinter(false);
        }
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            setIsScanning(true);
            await scanDevices();
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
            setIsScanning(false);
        }
    };

    const isCurrentPrinter = (device: Device) => {
        return currentPrinter?.address === device.address;
    };

    const removeCurrentPrinter = async () => {
        if (!currentPrinter) return;

        try {
            setIsRemovingCurrentPrinter(true);

            // Best-effort disconnect from the current printer on the native side
            if (currentPrinter.address) {
                try {
                    await BluetoothManager.disconnect(currentPrinter.address);
                } catch (error) {
                    console.error("Failed to disconnect printer", error);
                }
            }

            await AsyncStorage.removeItem("printer");
            setCurrentPrinter(null);
            console.log("Current Printer Removed Successfully");
        } catch (error) {
            console.error(error);
        } finally {
            setIsRemovingCurrentPrinter(false);
        }
    };

    const confirmRemoveCurrentPrinter = () => {
        if (!currentPrinter) return;

        Alert.alert(
            "Remove current printer?",
            "This will clear the selected printer on this device.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        removeCurrentPrinter();
                    },
                },
            ]
        );
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                currentPrinterContainer: {
                    backgroundColor: primary,
                    paddingHorizontal: wp(4),
                    paddingTop: hp(2),
                    paddingBottom: hp(1.5),
                    borderBottomWidth: wp(0.3),
                    borderBottomColor: secondary,
                },
                currentPrinterHeader: {
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: hp(1),
                },
                headerIcon: {
                    marginRight: wp(2),
                },
                currentPrinterTitle: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(5),
                    color: textOnPrimary,
                },
                currentPrinterCard: {
                    backgroundColor: secondary,
                    borderRadius: wp(3),
                    padding: wp(4),
                    borderWidth: wp(0.3),
                    borderColor: "#ddd",
                },
                currentPrinterCardActive: {
                    borderColor: strongPrimary,
                    borderWidth: wp(0.5),
                    backgroundColor: "#FFF8F0",
                },
                currentPrinterContent: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: wp(3),
                },
                currentPrinterInfo: {
                    flex: 1,
                },
                currentPrinterName: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4.5),
                    color: textOnPrimary,
                    marginBottom: hp(0.3),
                },
                currentPrinterAddress: {
                    fontFamily: "Gantari-Regular",
                    fontSize: wp(3.5),
                    color: textMuted,
                },
                noPrinterText: {
                    fontFamily: "Gantari-Regular",
                    fontSize: wp(4),
                    color: textMuted,
                    flex: 1,
                },
                refreshContainer: {
                    paddingHorizontal: wp(4),
                    paddingVertical: hp(1),
                    backgroundColor: primary,
                },
                refreshButton: {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: secondary,
                    paddingVertical: hp(1.5),
                    paddingHorizontal: wp(4),
                    borderRadius: wp(2.5),
                    borderWidth: wp(0.3),
                    borderColor: strongPrimary,
                    gap: wp(2),
                },
                refreshIcon: {
                    transform: [{ rotate: "0deg" }],
                },
                refreshIconSpinning: {
                    transform: [{ rotate: "360deg" }],
                },
                refreshButtonText: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4),
                    color: strongPrimary,
                },
                scrollView: {
                    flex: 1,
                },
                scrollContent: {
                    paddingHorizontal: wp(4),
                    paddingBottom: hp(4),
                },
                sectionContainer: {
                    marginTop: hp(2),
                },
                sectionHeader: {
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: hp(1.5),
                    gap: wp(2),
                },
                sectionTitle: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4.5),
                    color: textOnPrimary,
                },
                devicesList: {
                    gap: hp(1),
                },
                deviceCard: {
                    backgroundColor: secondary,
                    borderRadius: wp(3),
                    padding: wp(4),
                    borderWidth: wp(0.3),
                    borderColor: "#ddd",
                    marginBottom: hp(1),
                },
                deviceCardSelected: {
                    borderColor: strongPrimary,
                    borderWidth: wp(0.5),
                    backgroundColor: "#FFF8F0",
                },
                deviceCardContent: {
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: hp(1.5),
                    gap: wp(3),
                },
                deviceIconContainer: {
                    width: wp(12),
                    height: wp(12),
                    borderRadius: wp(2),
                    backgroundColor: primary,
                    alignItems: "center",
                    justifyContent: "center",
                },
                deviceInfo: {
                    flex: 1,
                },
                deviceName: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4.5),
                    color: textOnPrimary,
                    marginBottom: hp(0.3),
                },
                deviceNameSelected: {
                    color: strongPrimary,
                },
                deviceAddress: {
                    fontFamily: "Gantari-Regular",
                    fontSize: wp(3.5),
                    color: textMuted,
                    marginTop: hp(0.2),
                },
                currentBadge: {
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: hp(0.5),
                    gap: wp(1.5),
                },
                currentBadgeText: {
                    fontFamily: "Gantari-Medium",
                    fontSize: wp(3.5),
                    color: strongPrimary,
                },
                emptyState: {
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: hp(5),
                    paddingHorizontal: wp(5),
                },
                emptyStateText: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4.5),
                    color: textMuted,
                    marginTop: hp(2),
                    marginBottom: hp(0.5),
                },
                emptyStateSubtext: {
                    fontFamily: "Gantari-Regular",
                    fontSize: wp(3.8),
                    color: textMuted,
                    textAlign: "center",
                },
                loadingContainer: {
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: hp(3),
                    gap: hp(1),
                },
                loadingText: {
                    fontFamily: "Gantari-Regular",
                    fontSize: wp(4),
                    color: textMuted,
                },
                loadingOverlay: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 253, 240, 0.9)",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 999,
                },
                loadingOverlayContent: {
                    alignItems: "center",
                    gap: hp(2),
                },
                loadingOverlayText: {
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4.5),
                    color: strongPrimary,
                },
                currentPrinterActions: {
                    marginTop: hp(1.2),
                    paddingHorizontal: wp(1),
                },
            }),
        [primary, secondary, strongPrimary, textOnPrimary, textMuted]
    );

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: primary,
            }}
        >
            {/* Current Printer Card */}
            <View style={styles.currentPrinterContainer}>
                <View style={styles.currentPrinterHeader}>
                    <MaterialIcons
                        name="print"
                        size={wp(6)}
                        color={strongPrimary}
                        style={styles.headerIcon}
                    />
                    <Text style={styles.currentPrinterTitle}>
                        Current Printer
                    </Text>
                </View>
                <View
                    style={[
                        styles.currentPrinterCard,
                        currentPrinter && styles.currentPrinterCardActive,
                    ]}
                >
                    {currentPrinter ? (
                        <View style={styles.currentPrinterContent}>
                            <MaterialCommunityIcons
                                name="printer-check"
                                size={wp(7)}
                                color={strongPrimary}
                            />
                            <View style={styles.currentPrinterInfo}>
                                <Text style={styles.currentPrinterName}>
                                    {currentPrinter.name}
                                </Text>
                                <Text style={styles.currentPrinterAddress}>
                                    {currentPrinter.address}
                                </Text>
                            </View>
                            <MaterialIcons
                                name="check-circle"
                                size={wp(6)}
                                color={strongPrimary}
                            />
                        </View>
                    ) : (
                        <View style={styles.currentPrinterContent}>
                            <MaterialCommunityIcons
                                name="printer-off"
                                size={wp(7)}
                                color={textMuted}
                            />
                            <Text style={styles.noPrinterText}>
                                No printer selected
                            </Text>
                        </View>
                    )}
                </View>

                {currentPrinter && (
                    <View style={styles.currentPrinterActions}>
                        <CommonButton
                            onPress={confirmRemoveCurrentPrinter}
                            title={
                                isRemovingCurrentPrinter
                                    ? "Removing..."
                                    : "Remove Current Printer"
                            }
                            titleColor={primary}
                            backgroundColor="#E53935"
                            disabled={
                                isRemovingCurrentPrinter ||
                                isSavingCurrentPrinter
                            }
                            loading={isRemovingCurrentPrinter}
                            iconLeft={{
                                name: "delete",
                                family: "MaterialIcons",
                                color: primary,
                                size: wp(5),
                            }}
                        />
                    </View>
                )}
            </View>

            {/* Refresh Button */}
            <View style={styles.refreshContainer}>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={isScanning || refreshing}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="refresh"
                        size={wp(6)}
                        color={strongPrimary}
                        style={[
                            styles.refreshIcon,
                            (isScanning || refreshing) &&
                                styles.refreshIconSpinning,
                        ]}
                    />
                    <Text style={styles.refreshButtonText}>
                        {isScanning || refreshing
                            ? "Scanning..."
                            : "Refresh Devices"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={strongPrimary}
                        colors={[strongPrimary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Paired Devices Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons
                            name="bluetooth-connected"
                            size={wp(5.5)}
                            color={strongPrimary}
                        />
                        <Text style={styles.sectionTitle}>
                            Paired Devices (
                            {pairedDevices.filter((d) => d.name).length})
                        </Text>
                    </View>

                    {initialLoading || isScanning ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                color={strongPrimary}
                                size={wp(8)}
                            />
                            <Text style={styles.loadingText}>
                                Scanning for devices...
                            </Text>
                        </View>
                    ) : pairedDevices.filter((d) => d.name).length > 0 ? (
                        <View style={styles.devicesList}>
                            {pairedDevices
                                .filter((device) => device.name)
                                .map((item, index) => (
                                    <View
                                        key={item.address || index}
                                        style={[
                                            styles.deviceCard,
                                            isCurrentPrinter(item) &&
                                                styles.deviceCardSelected,
                                        ]}
                                    >
                                        <View style={styles.deviceCardContent}>
                                            <View
                                                style={
                                                    styles.deviceIconContainer
                                                }
                                            >
                                                <MaterialCommunityIcons
                                                    name="printer"
                                                    size={wp(7)}
                                                    color={
                                                        isCurrentPrinter(item)
                                                            ? strongPrimary
                                                            : "#666"
                                                    }
                                                />
                                            </View>
                                            <View style={styles.deviceInfo}>
                                                <Text
                                                    style={[
                                                        styles.deviceName,
                                                        isCurrentPrinter(
                                                            item
                                                        ) &&
                                                            styles.deviceNameSelected,
                                                    ]}
                                                >
                                                    {item.name}
                                                </Text>
                                                {item.address && (
                                                    <Text
                                                        style={
                                                            styles.deviceAddress
                                                        }
                                                    >
                                                        {item.address}
                                                    </Text>
                                                )}
                                                {isCurrentPrinter(item) && (
                                                    <View
                                                        style={
                                                            styles.currentBadge
                                                        }
                                                    >
                                                        <MaterialIcons
                                                            name="check-circle"
                                                            size={wp(4)}
                                                            color={
                                                                strongPrimary
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.currentBadgeText
                                                            }
                                                        >
                                                            Current Printer
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        {!isCurrentPrinter(item) && (
                                            <CommonButton
                                                onPress={async () => {
                                                    await saveCurrentPrinter(
                                                        item
                                                    );
                                                }}
                                                title="Set as Printer"
                                                titleColor={primary}
                                                backgroundColor={strongPrimary}
                                                disabled={
                                                    isSavingCurrentPrinter
                                                }
                                                loading={isSavingCurrentPrinter}
                                                iconLeft={{
                                                    name: "check",
                                                    family: "MaterialIcons",
                                                    color: primary,
                                                    size: wp(5),
                                                }}
                                            />
                                        )}
                                    </View>
                                ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="bluetooth-off"
                                size={wp(12)}
                                color="#ccc"
                            />
                            <Text style={styles.emptyStateText}>
                                No paired devices found
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Make sure Bluetooth is enabled and devices are
                                paired
                            </Text>
                        </View>
                    )}
                </View>

                {/* Found Devices Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons
                            name="bluetooth-searching"
                            size={wp(5.5)}
                            color={strongPrimary}
                        />
                        <Text style={styles.sectionTitle}>
                            Available Devices (
                            {foundDevices.filter((d) => d.name).length})
                        </Text>
                    </View>

                    {initialLoading || isScanning ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                color={strongPrimary}
                                size={wp(8)}
                            />
                            <Text style={styles.loadingText}>
                                Scanning for devices...
                            </Text>
                        </View>
                    ) : foundDevices.filter((d) => d.name).length > 0 ? (
                        <View style={styles.devicesList}>
                            {foundDevices
                                .filter((device) => device.name)
                                .map((item, index) => (
                                    <View
                                        key={item.address || index}
                                        style={styles.deviceCard}
                                    >
                                        <View style={styles.deviceCardContent}>
                                            <View
                                                style={
                                                    styles.deviceIconContainer
                                                }
                                            >
                                                <MaterialCommunityIcons
                                                    name="bluetooth"
                                                    size={wp(7)}
                                                    color="#666"
                                                />
                                            </View>
                                            <View style={styles.deviceInfo}>
                                                <Text style={styles.deviceName}>
                                                    {item.name}
                                                </Text>
                                                {item.address && (
                                                    <Text
                                                        style={
                                                            styles.deviceAddress
                                                        }
                                                    >
                                                        {item.address}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <CommonButton
                                            onPress={async () => {
                                                console.log(item.address);
                                                await pairDevice(item.address);
                                                await saveCurrentPrinter(item);
                                            }}
                                            title="Pair"
                                            backgroundColor={primary}
                                            titleColor={strongPrimary}
                                            disabled={isSavingCurrentPrinter}
                                            loading={isSavingCurrentPrinter}
                                            iconLeft={{
                                                name: "link",
                                                family: "MaterialIcons",
                                                color: strongPrimary,
                                                size: wp(5),
                                            }}
                                        />
                                    </View>
                                ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons
                                name="bluetooth-searching"
                                size={wp(12)}
                                color="#ccc"
                            />
                            <Text style={styles.emptyStateText}>
                                No devices found
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Pull down to refresh or tap the refresh button
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Loading Overlay */}
            {isSavingCurrentPrinter && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingOverlayContent}>
                        <ActivityIndicator
                            color={strongPrimary}
                            size={wp(10)}
                        />
                        <Text style={styles.loadingOverlayText}>
                            Setting printer...
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default PrinterConfigScreen;
