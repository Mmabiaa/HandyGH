import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface ButtonProps extends Omit<PaperButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  fullWidth = false,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'text':
        return styles.text;
      default:
        return styles.primary;
    }
  };

  const getMode = (): 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal' => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: spacing.xs,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  text: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
});
