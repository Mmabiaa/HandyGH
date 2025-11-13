import React from 'react';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'theme' | 'error'> {
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        error={!!error}
        style={[styles.input, style]}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        {...props}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
  },
});
