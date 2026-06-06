import { useRef } from "react";
import { Animated, Pressable } from "react-native";

export default function PressableBounce({ children, style, onPress, disabled, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, friction: 6, tension: 200, useNativeDriver: false }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: false }).start()}
      disabled={disabled}
      {...props}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
