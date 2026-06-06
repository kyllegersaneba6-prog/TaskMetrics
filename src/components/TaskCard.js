import { useMemo, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { COLORS, CATEGORY_COLORS, withAlpha, FONT, moderateScale, fontScale } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";
import { formatDate } from "../utils/dateHelpers";
import { useAnimatedPress, useAnimatedCheckbox, useSlideIn } from "../animations/entrance";

export default function TaskCard({ task, onPress, onDelete, onEdit, onToggleComplete, index = 0, highlighted = false }) {
  const { colors } = useTheme();
  const { scale: pressScale, onPressIn, onPressOut } = useAnimatedPress();
  const { scaleAnim, checkOpacity, animate: animateCheck } = useAnimatedCheckbox();
  const { opacity: slideOpacity, translateY } = useSlideIn(index * 80);
  const highlightScale = useRef(new Animated.Value(1)).current;
  const borderPulse = useRef(new Animated.Value(0)).current;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuBtnRef = useRef(null);
  const ms = moderateScale;
  const wasCompletedRef = useRef(task.status === "completed");

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
      borderRadius: ms(14),
      padding: ms(14),
      paddingLeft: ms(12),
      marginHorizontal: ms(20),
      marginVertical: ms(5),
      borderWidth: 1,
      borderColor: colors.border,
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
    menuBtn: {
      width: ms(32),
      height: ms(32),
      borderRadius: ms(8),
      justifyContent: "center",
      alignItems: "center",
      marginLeft: ms(8),
    },
    menuOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    menuModalOverlay: {
      flex: 1,
    },
    menuModalArea: {
      flex: 1,
    },
    menuDropdown: {
      backgroundColor: colors.surface,
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: ms(140),
      paddingVertical: ms(4),
      zIndex: 101,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: { elevation: 8 },
      }),
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(10),
      paddingHorizontal: ms(14),
      paddingVertical: ms(11),
    },
    menuItemText: {
      fontSize: fontScale(13),
      fontFamily: FONT.medium,
      color: colors.text,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: ms(10),
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
        <TouchableOpacity
          style={styles.card}
          onPress={() => onToggleComplete?.(task.id, task.status)}
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
              onPress={() => onToggleComplete?.(task.id, task.status)}
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
            <TouchableOpacity ref={menuBtnRef} style={styles.menuBtn} onPress={() => {
              menuBtnRef.current?.measureInWindow((x, y) => {
                setMenuPos({ x, y });
                setShowMenu(true);
              });
            }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="ellipsis-vertical" size={ms(15)} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {showMenu && (
          <Modal transparent animationType="none" visible={showMenu} onRequestClose={() => setShowMenu(false)}>
            <TouchableOpacity style={styles.menuModalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
              <View style={styles.menuModalArea}>
                <View style={[styles.menuDropdown, { position: "absolute", left: menuPos.x - ms(120), top: menuPos.y + ms(4) }]}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onPress?.(task); }}>
                    <Ionicons name="eye-outline" size={ms(17)} color={colors.textSecondary} />
                    <Text style={styles.menuItemText}>View</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onEdit?.(task); }}>
                    <Ionicons name="create-outline" size={ms(17)} color={colors.textSecondary} />
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onDelete?.(task); }}>
                    <Ionicons name="trash-outline" size={ms(17)} color={colors.danger} />
                    <Text style={[styles.menuItemText, { color: colors.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
