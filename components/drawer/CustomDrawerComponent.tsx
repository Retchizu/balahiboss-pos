import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { View, Image, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/config/firebaseConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "CHECKED_ORDERS";

const CustomDrawerComponent = (props: DrawerContentComponentProps) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#AFDDFF" }}>
      <Image
        source={require("../../assets/balahiboss.png")}
        style={{
          width: wp(25),
          height: wp(25),
          alignSelf: "center",
        }}
      />
      <Text style={styles.drawerHeaderTitle}>Advanced POS</Text>
      <Text style={styles.displayNameStyle}>
        {auth.currentUser?.displayName}
      </Text>
      <DrawerContentScrollView scrollEnabled={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: wp(3.5),
        }}
      >
        <DrawerItem
          style={{ flex: 1 }}
          label={({ color }) => (
            <Text style={[styles.drawerLabelStyle, { color }]}>About Us</Text>
          )}
          onPress={() => {
            router.navigate("/about")
          }}
          icon={({ color }) => (
            <MaterialIcons name="info-outline" size={wp(6)} color={color} />
          )}
        />
      </View>

      <View
        style={{
          marginBottom: hp(1),
          flexDirection: "row",
          borderTopWidth: wp(0.2),
          paddingHorizontal: wp(3.5),
        }}
      >
        <DrawerItem
          style={{ flex: 1 }}
          label={({ color }) => (
            <Text style={[styles.drawerLabelStyle, { color }]}>Sign out</Text>
          )}
          onPress={async () => {
            await auth.signOut();
            AsyncStorage.removeItem(STORAGE_KEY);
            router.replace("/");
          }}
          icon={({ color }) => (
            <Ionicons
              name="exit-outline"
              size={wp(6)}
              color={color}
              style={{ alignSelf: "center", top: hp(0.2) }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerComponent;

const styles = StyleSheet.create({
  drawerHeaderTitle: {
    fontFamily: "Gantari-SemiBold",
    color: "#634F40",
    fontSize: wp(6),
    textAlign: "center",
  },
  drawerLabelStyle: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(5),
  },
  displayNameStyle: {
    textAlign: "center",
    fontFamily: "Gantari-Regular",
    fontSize: wp(4),
  },
});
