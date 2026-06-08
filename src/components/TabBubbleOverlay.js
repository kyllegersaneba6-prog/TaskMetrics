import { useRef, useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

function useBubbleAnim(duration) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim;
}

function Bubble({ anim, size, color, xRange, yRange, sRange, style }) {
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: xRange });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: yRange });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: sRange });
  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateX }, { translateY }, { scale }],
        },
        style,
      ]}
    />
  );
}

export default function TabBubbleOverlay() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const b1 = useBubbleAnim(14000);
  const b2 = useBubbleAnim(11000);
  const b3 = useBubbleAnim(16000);

  const s1 = Math.max(width, height) * 0.5;
  const s2 = Math.max(width, height) * 0.35;
  const s3 = Math.max(width, height) * 0.25;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Bubble
        anim={b1}
        size={s1}
        color={isDark ? "#60A5FA55" : "#3B82F616"}
        xRange={[-width * 0.1, width * 0.15]}
        yRange={[-height * 0.05, height * 0.1]}
        sRange={[1, 1.12, 1]}
        style={{ top: -s1 * 0.2, right: -s1 * 0.3 }}
      />
      <Bubble
        anim={b2}
        size={s2}
        color={isDark ? "#A78BFA45" : "#8B5CF612"}
        xRange={[width * 0.12, -width * 0.08]}
        yRange={[height * 0.1, -height * 0.05]}
        sRange={[1, 1.15, 1]}
        style={{ bottom: -s2 * 0.15, left: -s2 * 0.25 }}
      />
      <Bubble
        anim={b3}
        size={s3}
        color={isDark ? "#22D3EE35" : "#06B6D410"}
        xRange={[-width * 0.04, width * 0.08]}
        yRange={[-height * 0.06, height * 0.06]}
        sRange={[1, 1.1, 1]}
        style={{ top: height * 0.5 - s3 / 2, right: width * 0.15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
  },
});
