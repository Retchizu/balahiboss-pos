import { Image, StyleSheet, Text, View, ImageBackground } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useToastContext } from "../context/ToastContext";
import { useUserContext } from "../context/UserContext";
import { signOut } from "../methods/auth-methods/signOut";

const CustomDrawerComponent = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation();
  const { showToast } = useToastContext();
  const { signUser, user } = useUserContext();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/buybuy.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View></View>
        <Image
          source={require("../assets/icon-transparent.png")}
          style={{
            width: wp(25),
            height: wp(25),
            alignSelf: "center",
          }}
        />
        <Text style={styles.drawerHeaderTitle}>Retchi POS</Text>
        <Text style={styles.displayNameStyle}>{user?.displayName}</Text>
        <DrawerContentScrollView scrollEnabled={false}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>

        <View
          style={{
            marginBottom: hp(1),
            flexDirection: "row",
            borderTopWidth: wp(0.2),
            borderColor: "#634F40",
            paddingHorizontal: wp(3.5),
          }}
        >
          <Ionicons
            name="exit-outline"
            size={26}
            color="#634F40"
            style={{ alignSelf: "center", top: hp(0.2) }}
          />

          <DrawerItem
            style={{ flex: 1 }}
            label={() => <Text style={styles.drawerLabelStyle}>Sign out</Text>}
            onPress={() => signOut(navigation, signUser, showToast)}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default CustomDrawerComponent;

const styles = StyleSheet.create({
  drawerHeaderTitle: {
    fontFamily: "SoraBold",
    color: "#634F40",
    fontSize: wp(6),
    textAlign: "center",
  },
  drawerLabelStyle: {
    textAlignVertical: "top",
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
    color: "#634F40",
  },
  displayNameStyle: {
    textAlign: "center",
    fontFamily: "SoraLight",
    fontSize: wp(3),
  },
});
