import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';

type ModalTemplateProp = {
  visible: boolean;
  onClose?: (event: GestureResponderEvent) => void;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ModalTemplate = ({ visible, onClose, children, width, height, style }: ModalTemplateProp) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        if (onClose) onClose({} as GestureResponderEvent);
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, {width, height}, style]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalTemplate;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFDF0',
    borderRadius: 12,
    padding: 20,
    maxWidth: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
