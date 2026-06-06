import { useRef, useEffect, useMemo } from "react";
import { View, Animated, PanResponder, StyleSheet, Dimensions, TouchableWithoutFeedback, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { moderateScale } from "../utils/constants";
import { setSheetOpen } from "../utils/sheetRef";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BottomSheet({ visible, onClose, onCloseStart, children, snapPoint = 0.78 }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const ms = moderateScale;
  const sheetHeight = SCREEN_HEIGHT * snapPoint;
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const open = useRef(false);

  const animateTo = (toValue, cb) => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: toValue === 0 ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(cb);
  };

  useEffect(() => {
    if (visible && !open.current) {
      open.current = true;
      setSheetOpen(true);
      translateY.setValue(sheetHeight);
      dragY.setValue(0);
      animateTo(0);
    } else if (!visible && open.current) {
      open.current = false;
      setSheetOpen(false);
      onCloseStart?.();
      animateTo(sheetHeight, () => onClose?.());
    }
  }, [visible]);

  const handlePanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
    onPanResponderMove: (_, gs) => {
      if (gs.dy > 0) {
        dragY.setValue(gs.dy);
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > sheetHeight * 0.2) {
        close();
      } else {
        Animated.spring(dragY, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }).start();
      }
    },
  }), [sheetHeight]);

  const close = () => {
    open.current = false;
    setSheetOpen(false);
    onCloseStart?.();
    animateTo(sheetHeight, () => onClose?.());
  };

  const animatedTranslate = Animated.add(translateY, dragY);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "none"}>
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: "rgba(0,0,0,0.4)" }]} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            backgroundColor: colors.surface,
            transform: [{ translateY: animatedTranslate }],
            paddingBottom: insets.bottom + ms(16),
          },
        ]}
      >
        <View style={styles.dragZone} {...handlePanResponder.panHandlers}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.textLight }]} />
          </View>
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  dragZone: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  handleWrap: {
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    flex: 1,
  },
});
