import { useMemo, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { CATEGORY_COLORS, withAlpha, FONT, moderateScale, fontScale } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";
import { formatDate } from "../utils/dateHelpers";
import { useAnimatedPress, useAnimatedCheckbox, useSlideIn } from "../animations/entrance";
import { registerCard, closeAll, setOpenId, getOpenId } from "../utils/swipeStore";

export default function TaskCard({ task, onPress, onDelete, onEdit, onToggleComplete, index = 0, highlighted = false }) {
  const { colors, mode } = useTheme();
  const { scale: pressScale, onPressIn, onPressOut } = useAnimatedPress();
  const { scaleAnim, checkOpacity, animate: animateCheck } = useAnimatedCheckbox();
  const { opacity: slideOpacity, translateY } = useSlideIn(index * 80);
  const highlightScale = useRef(new Animated.Value(1)).current;
  const borderPulse = useRef(new Animated.Value(0)).current;
  const ms = moderateScale;
  const wasCompletedRef = useRef(task.status === "completed");
  const OPEN_WIDTH = ms(180);
  const swipeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unregister = registerCard(task.id, () => {
      Animated.spring(swipeX, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }).start();
    });
    return unregister;
  }, [task.id, swipeX]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gs) =>
      Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove: (_, gs) => {
      const currentlyOpen = getOpenId();
      if (!currentlyOpen || currentlyOpen === task.id) {
        const dx = currentlyOpen === task.id ? -OPEN_WIDTH + gs.dx : gs.dx;
        swipeX.setValue(Math.max(-OPEN_WIDTH, Math.min(0, dx)));
      } else {
        closeAll();
        swipeX.setValue(Math.max(-OPEN_WIDTH, Math.min(0, gs.dx)));
      }
    },
    onPanResponderRelease: (_, gs) => {
      const currentlyOpen = getOpenId();
      const threshold = OPEN_WIDTH * 0.4;
      if ((currentlyOpen !== task.id && gs.dx < -threshold) || (currentlyOpen === task.id && gs.dx > threshold)) {
        const toValue = currentlyOpen === task.id ? 0 : -OPEN_WIDTH;
        Animated.spring(swipeX, { toValue, friction: 8, tension: 80, useNativeDriver: true }).start();
        if (currentlyOpen === task.id) setOpenId(null);
        else setOpenId(task.id);
      } else {
        Animated.spring(swipeX, { toValue: currentlyOpen === task.id ? -OPEN_WIDTH : 0, friction: 8, tension: 80, useNativeDriver: true }).start();
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(swipeX, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }).start();
      if (getOpenId() === task.id) setOpenId(null);
    },
  }), [OPEN_WIDTH, task.id]);

  useEffect(() => {
    if (highlighted) {
      highlightScale.setValue(1);
      borderPulse.setValue(0);

      Animated.sequence([
        Animated.spring(highlightScale, { toValue: 0.95, friction: 4, tension: 200, useNativeDriver: true }),
        Animated.spring(highlightScale, { toValue: 1.05, friction: 3, tension: 150, useNativeDriver: true }),
        Animated.spring(highlightScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
      ]).start();

      borderPulse.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderPulse, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(borderPulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        { iterations: 2 }
      ).start(() => {
        Animated.timing(borderPulse, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      });
    } else {
      highlightScale.setValue(1);
      borderPulse.setValue(0);
    }
  }, [highlighted]);

  useEffect(() => {
    if (task.status === "completed" && !wasCompletedRef.current) {
      animateCheck();
    } else if (task.status !== "completed" && wasCompletedRef.current) {
      checkOpacity.setValue(0);
    }
    wasCompletedRef.current = task.status === "completed";
  }, [task.status]);

  useEffect(() => {
    if (task.status === "completed") {
      checkOpacity.setValue(1);
    }
  }, []);

  const catColor = CATEGORY_COLORS[task.category] || colors.textSecondary;
  const descTrimmed = task.description ? task.description.slice(0, 70) + (task.description.length > 70 ? "..." : "") : "";

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      padding: ms(14),
      paddingLeft: ms(12),
    },
    leftAccent: {
      position: "absolute",
      left: 0,
      top: ms(14),
      bottom: ms(14),
      width: ms(3),
      borderRadius: ms(2),
    },
    bodyRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkboxTouch: {
      width: ms(22),
      height: ms(22),
      borderRadius: ms(7),
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginRight: ms(12),
    },
    contentWrap: {
      flex: 1,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: ms(4),
    },
    categoryDot: {
      width: ms(6),
      height: ms(6),
      borderRadius: ms(3),
      marginRight: ms(6),
    },
    categoryLabel: {
      fontSize: fontScale(10),
      fontFamily: FONT.semiBold,
      color: catColor,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    topSpacer: {
      flex: 1,
    },
    deadlineWrap: {
      flexDirection: "row",
      alignItems: "center",
    },
    deadlineIcon: {
      marginRight: ms(3),
    },
    deadlineText: {
      fontSize: fontScale(10),
      fontFamily: FONT.regular,
      color: colors.textLight,
    },
    title: {
      fontSize: fontScale(15),
      fontFamily: FONT.semiBold,
      color: colors.text,
      marginBottom: descTrimmed ? ms(3) : 0,
    },
    description: {
      fontSize: fontScale(12),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      lineHeight: ms(16),
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: ms(8),
    },
    swipeContainer: {
      overflow: "hidden",
      borderRadius: ms(14),
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: ms(20),
      marginVertical: ms(5),
    },
    actionsRow: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: "row",
      width: ms(180),
    },
    actionBtn: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: ms(4),
    },
    actionText: {
      fontSize: fontScale(10),
      fontFamily: FONT.semiBold,
      color: "#FFF",
    },
    highlightBorder: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: ms(14),
      borderWidth: 2,
    },
    completedTitle: {
      textDecorationLine: "line-through",
      color: colors.textLight,
    },
  }), [colors, catColor]);

  const highlightBorderColor = borderPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View style={{ opacity: slideOpacity, transform: [{ translateY }] }}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Animated.View style={{ transform: [{ scale: highlightScale }] }}>
        <View style={styles.swipeContainer}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: mode === "dark" ? "#3B82F6" : colors.primary }]} onPress={() => onPress?.(task)}>
              <Ionicons name="eye-outline" size={ms(20)} color="#FFF" />
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: mode === "dark" ? "#F59E0B" : colors.warning }]} onPress={() => onEdit?.(task)}>
              <Ionicons name="create-outline" size={ms(20)} color="#FFF" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: mode === "dark" ? "#EF4444" : colors.danger }]} onPress={() => onDelete?.(task)}>
              <Ionicons name="trash-outline" size={ms(20)} color="#FFF" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={{ transform: [{ translateX: swipeX }], backgroundColor: colors.surface }}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                if (getOpenId() === task.id) {
                  closeAll();
                  return;
                }
                onToggleComplete?.(task.id, task.status);
              }}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={1}
            >
              {highlighted && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.highlightBorder,
                    { borderColor: highlightBorderColor, opacity: borderPulse },
                  ]}
                />
              )}
              <View style={[styles.leftAccent, { backgroundColor: catColor }]} />
              <View style={styles.bodyRow}>
                <TouchableOpacity
              onPress={() => {
                if (getOpenId() === task.id) closeAll();
                else onToggleComplete?.(task.id, task.status);
              }}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.checkboxTouch,
                      {
                        borderColor: catColor,
                        backgroundColor: task.status === "completed" ? withAlpha(catColor, 0.15) : "transparent",
                      },
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                  >
                    <Animated.View style={{ opacity: checkOpacity }}>
                      <Ionicons name="checkmark" size={ms(13)} color={catColor} />
                    </Animated.View>
                  </Animated.View>
                </TouchableOpacity>
                <View style={styles.contentWrap}>
                  <View style={styles.topRow}>
                    <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
                    <Text style={styles.categoryLabel} numberOfLines={1}>{task.category}</Text>
                    <View style={styles.topSpacer} />
                    {task.deadline ? (
                      <View style={styles.deadlineWrap}>
                        <Ionicons name="calendar-outline" size={ms(11)} color={colors.textLight} style={styles.deadlineIcon} />
                        <Text style={styles.deadlineText}>{formatDate(task.deadline)}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.title, task.status === "completed" && styles.completedTitle]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {descTrimmed ? (
                    <Text style={styles.description} numberOfLines={1}>{descTrimmed}</Text>
                  ) : null}
                  <View style={styles.statusRow}>
                    <StatusBadge status={task.status} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
