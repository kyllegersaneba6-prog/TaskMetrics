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

export default function AuthBubbleOverlay() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const b1 = useBubbleAnim(9000);
  const b2 = useBubbleAnim(11000);

  const s1 = Math.max(width, height) * 0.35;
  const s2 = Math.max(width, height) * 0.28;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Bubble
        anim={b1}
        size={s1}
        color={isDark ? "#A78BFA60" : "#8B5CF620"}
        xRange={[-width * 0.08, width * 0.12]}
        yRange={[height * 0.02, -height * 0.08]}
        sRange={[1, 1.15, 1]}
        style={{ top: -s1 * 0.15, left: -s1 * 0.2 }}
      />
      <Bubble
        anim={b2}
        size={s2}
        color={isDark ? "#F472B650" : "#EC489918"}
        xRange={[width * 0.1, -width * 0.06]}
        yRange={[-height * 0.04, height * 0.1]}
        sRange={[1, 1.12, 1]}
        style={{ bottom: -s2 * 0.1, right: -s2 * 0.2 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
  },
});
