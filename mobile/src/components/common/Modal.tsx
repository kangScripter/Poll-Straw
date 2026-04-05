import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  presentationStyle?: 'pageSheet' | 'formSheet' | 'fullScreen';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = 'slide',
  presentationStyle = 'pageSheet',
}) => {
  const { theme } = useTheme();

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      presentationStyle={presentationStyle}
      transparent={animationType === 'fade'}
      onRequestClose={onClose}
    >
      {animationType === 'fade' ? (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.modalContent, {
                  backgroundColor: theme.surface,
                  borderTopWidth: 3,
                  borderTopColor: theme.borderAccent,
                }]}
              >
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                  {title && (
                    <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
                      {showCloseButton && (
                        <TouchableOpacity
                          onPress={onClose}
                          style={[styles.closeButton, { backgroundColor: theme.surfaceSubtle }]}
                        >
                          <Ionicons name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {children}
                </SafeAreaView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]} edges={['top']}>
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            {title && <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>}
            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.surfaceSubtle }]}
              >
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            {children}
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});
