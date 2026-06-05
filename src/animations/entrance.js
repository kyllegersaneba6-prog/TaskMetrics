import { useRef, useEffect } from "react";
import { Animated } from "react-native";

export function useFadeIn(delay = 0, duration = 350) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return opacity;
}

export function useSlideIn(delay = 0, direction = "up", distance = 20, duration = 350) {
  const translateY = useRef(new Animated.Value(direction === "up" ? distance : -distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return { opacity, translateY };
}

export function useScaleIn(delay = 0, duration = 350) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return { opacity, scale };
}

export function useAnimatedPress() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
}

export function useAnimatedCheckbox() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const animate = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.timing(checkOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return { scaleAnim, checkOpacity, animate };
}
