import React, { useEffect, useRef } from 'react';
import { Text, Animated, Easing, StyleSheet } from 'react-native';
import { Dumbbell } from 'lucide-react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Continuous 360 degree rotation
      const rotationLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Subtle pulse effect
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      rotationLoop.start();
      pulseLoop.start();

      return () => {
        rotationLoop.stop();
        pulseLoop.stop();
        rotateAnim.setValue(0);
        pulseAnim.setValue(1);
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        { opacity: fadeAnim },
      ]}
      pointerEvents="auto"
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Dumbbell size={32} color="#2563EB" />
        </Animated.View>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Semi-transparent slate-900
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 150,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
});
