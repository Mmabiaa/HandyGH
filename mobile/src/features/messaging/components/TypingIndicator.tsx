import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  userName?: string;
}

/**
 * TypingIndicator component shows when the other user is typing
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName = 'User',
}) => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (
      dotOpacity: Animated.Value,
      delay: number
    ): Animated.CompositeAnimation => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = animateDot(dot1Opacity, 0);
    const animation2 = animateDot(dot2Opacity, 200);
    const animation3 = animateDot(dot3Opacity, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={styles.container} accessibilityLabel={`${userName} is typing`}>
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[styles.dot, { opacity: dot1Opacity }]}
          />
          <Animated.View
            style={[styles.dot, { opacity: dot2Opacity }]}
          />
          <Animated.View
            style={[styles.dot, { opacity: dot3Opacity }]}
          />
        </View>
      </View>
      <Text style={styles.text}>{userName} is typing...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  bubble: {
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  text: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginLeft: 12,
  },
});
