import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { handleSignOut } from "@/methods/auth/handleSignOut";
import Toast from "react-native-toast-message";
import { isAxiosError } from "axios";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const SettingsScreen = () => {
  const {
    themeMode,
    setThemeMode,
    primary,
    secondary,
    strongPrimary,
    textOnSecondary,
    textOnStrongPrimary,
    textMuted,
  } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const onSignOut = async () => {
    setIsSigningOut(true);
    const { success, error } = await handleSignOut();
    setIsSigningOut(false);
    if (!success && error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: `${error.response?.data?.error ?? "Sign out failed"}`,
        });
      }
      console.log(error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: primary }]}
      contentContainerStyle={styles.content}
    >
      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: strongPrimary }]}>
          Appearance
        </Text>
        <Text style={[styles.sectionLabel, { color: textMuted }]}>Theme</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              {
                backgroundColor:
                  themeMode === "light" ? strongPrimary : secondary,
                borderColor: strongPrimary,
              },
            ]}
            onPress={() => setThemeMode("light")}
          >
            <Ionicons
              name="sunny-outline"
              size={wp(5)}
              color={themeMode === "light" ? textOnStrongPrimary : textOnSecondary}
            />
            <Text
              style={[
                styles.segmentButtonText,
                {
                  color: themeMode === "light" ? textOnStrongPrimary : textOnSecondary,
                },
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              {
                backgroundColor:
                  themeMode === "dark" ? strongPrimary : secondary,
                borderColor: strongPrimary,
              },
            ]}
            onPress={() => setThemeMode("dark")}
          >
            <Ionicons
              name="moon-outline"
              size={wp(5)}
              color={themeMode === "dark" ? textOnStrongPrimary : textOnSecondary}
            />
            <Text
              style={[
                styles.segmentButtonText,
                {
                  color: themeMode === "dark" ? textOnStrongPrimary : textOnSecondary,
                },
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: strongPrimary }]}>
          About
        </Text>
        <TouchableOpacity
          style={[
            styles.navRow,
            { backgroundColor: secondary, borderColor: textMuted },
          ]}
          onPress={() => router.push("/(home)/(settings)/about")}
        >
          <Ionicons name="information-circle-outline" size={wp(5)} color={strongPrimary} />
          <Text style={[styles.navRowText, { color: strongPrimary }]}>
            About Us
          </Text>
          <Ionicons name="chevron-forward" size={wp(5)} color={textMuted} />
        </TouchableOpacity>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: strongPrimary }]}>
          Account
        </Text>
        <TouchableOpacity
          style={[
            styles.signOutButton,
            { backgroundColor: secondary, borderColor: textMuted },
          ]}
          onPress={onSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={strongPrimary} />
          ) : (
            <>
              <Ionicons name="exit-outline" size={wp(5)} color={strongPrimary} />
              <Text style={[styles.signOutText, { color: strongPrimary }]}>
                Sign out
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4.5),
    marginBottom: hp(1),
  },
  sectionLabel: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(4),
    marginBottom: hp(1),
  },
  segmentRow: {
    flexDirection: "row",
    gap: wp(3),
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 1.5,
  },
  segmentButtonText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 1.5,
  },
  signOutText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 1.5,
  },
  navRowText: {
    flex: 1,
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
});
