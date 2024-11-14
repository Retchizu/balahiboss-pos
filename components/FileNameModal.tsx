import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React from "react";
import { Button } from "@rneui/base";
import Toast from "react-native-toast-message";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type FileNameModalProp = {
  isFileNameVisible: boolean;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  confirmFn: () => Promise<void>;
  choice: { key: number; choiceName: string } | null;
  conversionLoading: boolean;
  onFileModalClose: () => void;
};

const FileNameModal: React.FC<FileNameModalProp> = ({
  isFileNameVisible,
  fileName,
  setFileName,
  confirmFn,
  choice,
  conversionLoading,
  onFileModalClose,
}) => {
  const getReportType = (
    choice: { key: number; choiceName: string } | null
  ) => {
    switch (choice?.key) {
      case 1:
        return "Stock Sold";
      case 2:
        return "Product";
      case 3:
        return "Sales";
      default:
        return "";
    }
  };
  return (
    <Modal
      transparent
      visible={isFileNameVisible}
      onRequestClose={() => {
        onFileModalClose();
      }}
    >
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={30}>
          <View style={styles.childContainer}>
            <View style={styles.headerView}>
              <Text style={{ fontFamily: "SoraMedium", fontSize: wp(5.5) }}>
                Export {getReportType(choice)} Report to Excel
              </Text>
            </View>
            <View style={styles.bodyView}>
              <Text style={styles.inputTitleStyle}>Filename:</Text>
              <TextInput
                value={fileName}
                onChangeText={(text) => setFileName(text)}
                style={styles.inputStyle}
              />
              <View style={styles.buttonContainer}>
                <Button
                  buttonStyle={styles.buttonStyle}
                  title={"Cancel"}
                  onPress={() => {
                    onFileModalClose();
                  }}
                />
                <Button
                  buttonStyle={styles.buttonStyle}
                  title={"Confirm"}
                  onPress={() => confirmFn()}
                  loading={conversionLoading}
                />
              </View>
            </View>
          </View>
          <Toast position="bottom" autoHide visibilityTime={2000} />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default FileNameModal;

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
  inputTitleStyle: { fontFamily: "SoraRegular", fontSize: wp(5) },
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
