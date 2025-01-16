import { StyleSheet, Text, Modal, View, TextInput } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type SaveDraftModalType = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  draftTitle: string;
  setDraftTitle: React.Dispatch<React.SetStateAction<string>>;
  confirmFn: () => void;
  saveDraftButtonLoading: boolean;
};
const SaveDraftModal: React.FC<SaveDraftModalType> = ({
  isVisible,
  setIsVisible,
  confirmFn,
  draftTitle,
  setDraftTitle,
  saveDraftButtonLoading,
}) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView behavior="position">
          <View style={styles.childContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitleStyle}>Save Invoice</Text>
            </View>

            <View style={{ padding: wp(3) }}>
              <Text style={styles.draftTitleStyle}>Invoice draft title:</Text>
              <TextInput
                style={styles.draftInputStyle}
                placeholder="Draft title"
                value={draftTitle}
                onChangeText={(text) => setDraftTitle(text)}
              />

              <View style={styles.buttonContainer}>
                <Button
                  buttonStyle={styles.buttonStyle}
                  title={"Cancel"}
                  onPress={() => setIsVisible(false)}
                />
                <Button
                  buttonStyle={styles.buttonStyle}
                  title={"Confirm"}
                  onPress={() => confirmFn()}
                  loading={saveDraftButtonLoading}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default SaveDraftModal;

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
  draftInputStyle: {
    borderWidth: wp(0.2),
    borderColor: "#634F40",
    borderRadius: wp(1.5),
    padding: wp(1),
    fontSize: wp(4),
    fontFamily: "SoraRegular",
    marginTop: hp(1),
  },
  draftTitleStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(4.5),
  },
  headerTitleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(5),
  },
  headerContainer: { borderBottomWidth: wp(0.2), padding: wp(2) },
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
