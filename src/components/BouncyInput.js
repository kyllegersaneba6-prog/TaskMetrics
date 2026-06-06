import React, { useRef } from "react";
import { Animated } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function BouncyInput({ children, style }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.02, friction: 6, tension: 200, useNativeDriver: false }),
      Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: false }),
      Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const enhanced = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child, {
      onFocus: (e) => { animateIn(); child.props.onFocus?.(e); },
      onBlur: (e) => { animateOut(); child.props.onBlur?.(e); },
    });
  });

  return (
    <Animated.View style={[style, { transform: [{ scale }], borderColor }]}>
      {enhanced}
    </Animated.View>
  );
}
