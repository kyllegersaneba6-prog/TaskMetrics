import { useRef, useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const circleSize = Math.max(width, height) * 0.6;

export default function AnimatedBackground({
  colors = ["#3B82F6", "#8B5CF6", "#06B6D4"],
  children,
}) {
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(circle1Anim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1Anim, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(circle2Anim, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Anim, {
          toValue: 0,
          duration: 12000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    loop2.start();
    return () => {
      loop.stop();
      loop2.stop();
    };
  }, []);

  const c1x = circle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.1, width * 0.15],
  });
  const c1y = circle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height * 0.05, height * 0.1],
  });
  const c1s = circle1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  const c2x = circle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.12, -width * 0.08],
  });
  const c2y = circle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.1, -height * 0.05],
  });
  const c2s = circle2Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors[0] + "10", colors[1] + "10", colors[2] + "10"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            top: -circleSize * 0.2,
            right: -circleSize * 0.3,
            backgroundColor: colors[0] + "25",
            transform: [{ translateX: c1x }, { translateY: c1y }, { scale: c1s }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: circleSize * 0.8,
            height: circleSize * 0.8,
            bottom: -circleSize * 0.15,
            left: -circleSize * 0.25,
            backgroundColor: colors[1] + "20",
            transform: [{ translateX: c2x }, { translateY: c2y }, { scale: c2s }],
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    borderRadius: 9999,
  },
});
