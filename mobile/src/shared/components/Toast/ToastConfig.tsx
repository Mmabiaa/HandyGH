import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';

/**
 * Custom Toast configuration
 * Requirement 16.3, 16.5: User feedback with toast messages
 */

type ToastProps = {
  text1?: string;
  text2?: string;
  props?: any;
};

export const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  info: (props: ToastProps) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  warning: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={styles.warningToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  critical: ({ text1, text2 }: ToastProps) => (
    <View style={styles.criticalToast}>
      <View style={styles.criticalContent}>
        <Text style={styles.criticalIcon}>⚠️</Text>
        <View style={styles.criticalTextContainer}>
          <Text style={styles.criticalText1}>{text1}</Text>
          {text2 && <Text style={styles.criticalText2}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#4caf50',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
  },
  errorToast: {
    borderLeftColor: '#f44336',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
  },
  infoToast: {
    borderLeftColor: '#2196F3',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
  },
  warningToast: {
    borderLeftColor: '#ff9800',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  text2: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  criticalToast: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  criticalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criticalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  criticalTextContainer: {
    flex: 1,
  },
  criticalText1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  criticalText2: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
});
