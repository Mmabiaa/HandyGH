import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './context';
import AnimatedLogo from './components/AnimatedLogo';
import GradientBackground from './components/GradientBackground';

const WelcomeScreen = () => {
  const { colors } = useTheme();

  return (
    <GradientBackground colors={[colors.gold, colors.green]}>
      <View style={styles.container}>
        <AnimatedLogo />
        <Text style={styles.title}>Welcome to HandyGH</Text>
        <Text style={styles.subtitle}>Your handy services at your fingertips</Text>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
