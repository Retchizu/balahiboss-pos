import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Feather, AntDesign, Entypo } from "@expo/vector-icons";
type Props = {
  setIsVisible: (value: React.SetStateAction<boolean>) => void;
  handleEditModalVisible: () => void;
};
const AnimatedFloatingButton = ({
  setIsVisible,
  handleEditModalVisible,
}: Props) => {
  const [animation] = useState(new Animated.Value(0));
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    setOpen(!open);

    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const editItemStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
  };

  const deleteItemStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };
  return (
    <View style={[styles.container]}>
      <TouchableWithoutFeedback onPress={() => setIsVisible(true)}>
        <Animated.View
          style={[
            styles.button,
            styles.secondary,
            styles.menu,
            deleteItemStyle,
            { padding: wp("2%") },
          ]}
        >
          <Feather name="trash-2" size={30} color="black" />
        </Animated.View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={() => handleEditModalVisible()}>
        <Animated.View
          style={[
            styles.button,
            styles.secondary,
            styles.menu,
            editItemStyle,
            { padding: wp("2%") },
          ]}
        >
          <Entypo name="pencil" size={30} color="black" />
        </Animated.View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={toggleMenu}>
        <Animated.View style={[styles.button, styles.menu, rotation]}>
          <AntDesign name="caretdown" size={30} color="black" />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default AnimatedFloatingButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "absolute",
    bottom: hp("7%"),
    right: wp("8%"),
  },
  button: {
    position: "absolute",
    padding: wp("3%"),
    borderRadius: hp("20"),
    elevation: 5,
  },
  menu: {
    backgroundColor: "pink",
  },
  secondary: {
    borderRadius: hp("20"),
  },
});
