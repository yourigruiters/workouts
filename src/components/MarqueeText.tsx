import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, Platform, LayoutChangeEvent } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface MarqueeTextProps {
  text: string;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({ text }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') return; // Web uses CSS animation

    if (containerWidth > 0 && textWidth > 0) {
      const startX = Math.max(0, containerWidth - textWidth);
      const endX = 0;
      const distance = Math.max(60, Math.abs(startX - endX));
      const duration = Math.max(5000, distance * 30);

      animatedValue.setValue(startX);

      const animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: endX,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();

      return () => animation.stop();
    }
  }, [containerWidth, textWidth, text]);

  if (Platform.OS === 'web') {
    return (
      <View className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex-row items-center overflow-hidden">
        <View className="z-10 bg-amber-50 pr-2">
          <AlertTriangle size={15} color="#D97706" />
        </View>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <style>
            {`
              @keyframes slideRightToLeftInside {
                0% {
                  left: 100%;
                  transform: translateX(-100%);
                }
                100% {
                  left: 0%;
                  transform: translateX(0%);
                }
              }
              .marquee-single-text {
                position: absolute;
                top: 0;
                white-space: nowrap;
                animation: slideRightToLeftInside 8s linear infinite;
              }
            `}
          </style>
          <span className="marquee-single-text font-bold text-xs text-amber-900 tracking-wide">
            {text}
          </span>
        </div>
      </View>
    );
  }

  return (
    <View
      onLayout={(e: LayoutChangeEvent) =>
        setContainerWidth(e.nativeEvent.layout.width - 40)
      }
      className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex-row items-center overflow-hidden"
    >
      <View className="z-10 bg-amber-50 pr-2">
        <AlertTriangle size={15} color="#D97706" />
      </View>
      <View className="flex-1 overflow-hidden h-[18px] justify-center">
        <Animated.View
          style={{
            transform: [{ translateX: animatedValue }],
            flexDirection: 'row',
          }}
        >
          <Text
            onLayout={(e: LayoutChangeEvent) =>
              setTextWidth(e.nativeEvent.layout.width)
            }
            numberOfLines={1}
            className="text-amber-900 font-bold text-xs tracking-wide"
          >
            {text}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};
