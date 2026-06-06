import { useRef, useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

function useBubbleAnim(duration = 12000) {
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
        styles.circle,
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

export default function AnimatedBackground({
  colors = ["#3B82F6", "#8B5CF6", "#06B6D4"],
  backgroundBubbles = true,
  children,
}) {
  const b1 = useBubbleAnim(14000);
  const b2 = useBubbleAnim(11000);
  const b3 = useBubbleAnim(16000);

  const s1 = Math.max(width, height) * 0.55;
  const s2 = Math.max(width, height) * 0.4;
  const s3 = Math.max(width, height) * 0.3;

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors[0] + "08", colors[1] + "08", colors[2] + "08"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {backgroundBubbles && (
        <>
          <Bubble
            anim={b1}
            size={s1}
            color={colors[0] + "18"}
            xRange={[-width * 0.12, width * 0.18]}
            yRange={[-height * 0.06, height * 0.12]}
            sRange={[1, 1.12, 1]}
            style={{ top: -s1 * 0.2, right: -s1 * 0.3 }}
          />
          <Bubble
            anim={b2}
            size={s2}
            color={colors[1] + "14"}
            xRange={[width * 0.15, -width * 0.1]}
            yRange={[height * 0.12, -height * 0.06]}
            sRange={[1, 1.18, 1]}
            style={{ bottom: -s2 * 0.15, left: -s2 * 0.25 }}
          />
          <Bubble
            anim={b3}
            size={s3}
            color={colors[2] + "10"}
            xRange={[-width * 0.05, width * 0.1]}
            yRange={[-height * 0.08, height * 0.08]}
            sRange={[1, 1.1, 1]}
            style={{ top: height * 0.5 - s3 / 2, left: width * 0.5 - s3 / 2 }}
          />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
  },
});
