import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ConversionOptionsModal = {
  isConversionOptionsVisible: boolean;
  setIsConversionOptionsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  choices: { key: number; choiceName: string }[];
  setSelectedChoice: React.Dispatch<
    React.SetStateAction<{ key: number; choiceName: string } | null>
  >;
  setIsFileNameVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConversionOptionsModal: React.FC<ConversionOptionsModal> = ({
  isConversionOptionsVisible,
  setIsConversionOptionsVisible,
  choices,
  setSelectedChoice,
  setIsFileNameVisible,
}) => {
  return (
    <Modal
      transparent
      visible={isConversionOptionsVisible}
      onRequestClose={() => {
        setSelectedChoice(null);
        setIsConversionOptionsVisible(false);
      }}
    >
      <View style={styles.mainContainer}>
        <View style={styles.childContainer}>
          <View style={styles.headerView}>
            <Text style={{ fontFamily: "SoraMedium", fontSize: wp(5.5) }}>
              Conversion Options
            </Text>
          </View>
          <View style={styles.bodyView}>
            {choices.map((choice) => (
              <TouchableOpacity
                key={choice.key}
                style={{
                  borderBottomWidth: wp(0.2),
                  borderBottomColor: "#634F40",
                  padding: wp(2),
                }}
                onPress={() => {
                  setIsConversionOptionsVisible(false);
                  setIsFileNameVisible(true);
                  setSelectedChoice(choice);
                }}
              >
                <Text style={styles.choiceStyle}>{choice.choiceName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConversionOptionsModal;

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
  headerView: {
    borderColor: "#634F40",
    borderBottomWidth: wp(0.3),
    paddingBottom: hp(2),
    paddingHorizontal: wp(3),
  },
  bodyView: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
  },
  choiceStyle: { fontFamily: "SoraRegular", fontSize: wp(5) },
  inputStyle: {
    borderColor: "#E6B794",
    borderWidth: wp(0.3),
    borderRadius: wp(2),
    fontFamily: "SoraRegular",
    fontSize: wp(5),
    paddingHorizontal: wp(2),
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
