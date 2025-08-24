import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useBluetoothPrinter from "@/hooks/useBluetoothPrinter";
import CommonButton from "@/components/buttons/CommonButton";
import { Device } from "@brooons/react-native-bluetooth-escpos-printer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PrinterConfigScreen = () => {
  const { foundDevices, pairedDevices, scanDevices } = useBluetoothPrinter();
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentPrinter, setCurrentPrinter] = useState<Device | null>(null);

  useEffect(() => {
    const getSavedCurrentPrinter = async () => {
      try {
        setInitialLoading(true);
        const savedCurrentPrinter = await AsyncStorage.getItem("printer");
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
        setInitialLoading(true);
        await scanDevices();
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };

    showAvailableDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isSavingCurrentPrinter, setIsSavingCurrentPrinter] = useState(false);

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

  console.log("foundDevices", foundDevices);
  console.log(initialLoading);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <View
        style={{
          zIndex: 1,
          opacity: isSavingCurrentPrinter ? 0.1 : 1,
          flex: 1,
        }}
      >
        {initialLoading && (
          <View
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            <ActivityIndicator color={strongPrimary} size={wp(10)} />
          </View>
        )}

        <View style={{ height: hp(40) }}>
          <Text style={styles.deviceCategoryLabel}>Paired Devices</Text>
          {pairedDevices.length > 0 && !initialLoading && (
            <>
              <FlatList
                data={pairedDevices}
                renderItem={({ item }) => {
                  if (!item.name) {
                    return null;
                  }
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        marginVertical: hp(1),
                        gap: wp(6),
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: secondary,
                          padding: wp(4),
                          borderRadius: wp(3),
                        }}
                      >
                        <Text style={styles.deviceLabel}>{item.name}</Text>
                      </View>

                      <CommonButton
                        onPress={async () => {
                          await saveCurrentPrinter(item);
                        }}
                        title="Set as Printer"
                        titleColor={primary}
                        disabled={isSavingCurrentPrinter}
                      />
                    </View>
                  );
                }}
                style={{ marginTop: hp(2) }}
              />
            </>
          )}
        </View>
        <View style={{ height: hp(40) }}>
          <Text style={styles.deviceCategoryLabel}>Found Devices</Text>
          {foundDevices.length > 0 && !initialLoading && (
            <>
              <FlatList
                data={foundDevices}
                renderItem={({ item }) => {
                  if (!item.name) {
                    return null;
                  }
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        marginVertical: hp(1),
                        gap: wp(6),
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: secondary,
                          padding: wp(4),
                          borderRadius: wp(3),
                        }}
                      >
                        <Text style={styles.deviceLabel}>{item.name}</Text>
                      </View>
                      <CommonButton
                        onPress={() => {}}
                        title="Pair"
                        backgroundColor={primary}
                        disabled={isSavingCurrentPrinter}
                      />
                    </View>
                  );
                }}
              />
            </>
          )}
        </View>
        <View
          style={{
            backgroundColor: primary,
            elevation: 2,
            borderRadius: wp(2),
            padding: wp(2),
          }}
        >
          <Text style={styles.deviceCategoryLabel}>
            Current Printer: {currentPrinter ? currentPrinter.name : "Not set"}
          </Text>
        </View>
      </View>

      {isSavingCurrentPrinter && (
        <ActivityIndicator
          color={strongPrimary}
          size={wp(10)}
          style={{
            zIndex: 2,
            position: "absolute",
            top: hp(40),
            left: wp(45),
          }}
        />
      )}
    </View>
  );
};

export default PrinterConfigScreen;

const styles = StyleSheet.create({
  deviceLabel: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(4),
    width: wp(40),
  },
  deviceCategoryLabel: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4.5),
  },
});
