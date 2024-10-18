import { Modal, StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";
import Entypo from "@expo/vector-icons/Entypo";

type ConfirmationModalProp = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  confirmationTitle: string;
  confirmationDescription?: string;
  cancelFn: () => void;
  confirmFn: () => void;
};
const ConfirmationModal = ({
  isVisible,
  setIsVisible,
  confirmationTitle,
  confirmationDescription,
  confirmFn,
  cancelFn,
}: ConfirmationModalProp) => {
  return (
    <Modal
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      transparent
    >
      <View style={styles.mainContainer}>
        <View style={styles.childContainer}>
          <View
            style={{
              borderBottomWidth: wp(0.5),
              paddingBottom: hp(1),
              borderColor: "#634F40",
            }}
          >
            <Text style={styles.confirmationTitleStyle}>
              {confirmationTitle}
            </Text>
          </View>

          <Text style={styles.confirmatioDescriptionStyle}>
            {confirmationDescription}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              buttonStyle={styles.buttonStyle}
              title={"Cancel"}
              onPress={() => cancelFn()}
            />
            <Button
              buttonStyle={styles.buttonStyle}
              title={"Confirm"}
              onPress={() => confirmFn()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: wp(2),
    justifyContent: "center",
  },
  childContainer: {
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(2),
    paddingVertical: hp(2),
    borderRadius: wp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmationTitleStyle: {
    fontFamily: "SoraBold",
    fontSize: wp(4),
  },
  confirmatioDescriptionStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3.5),
    paddingVertical: hp(1),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: hp(2),
  },

  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    marginHorizontal: wp(2),
  },
});
