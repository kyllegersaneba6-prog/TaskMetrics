import { useMemo, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import { COLORS, CATEGORY_COLORS, withAlpha, FONT, moderateScale, fontScale } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";
import { formatDate, isOverdue } from "../utils/dateHelpers";
import { useAnimatedPress, useAnimatedCheckbox, useSlideIn } from "../animations/entrance";

export default function TaskCard({ task, onPress, onDelete, index = 0 }) {
  const { colors } = useTheme();
  const overdue = isOverdue(task.deadline) && task.status !== "completed";
  const { scale: pressScale, onPressIn, onPressOut } = useAnimatedPress();
  const { scaleAnim, checkOpacity, animate: animateCheck } = useAnimatedCheckbox();
  const { opacity, translateY } = useSlideIn(index * 80);

  const ms = moderateScale;

  const wasCompletedRef = useRef(task.status === "completed");

  useEffect(() => {
    if (task.status === "completed" && !wasCompletedRef.current) {
      animateCheck();
    }
    wasCompletedRef.current = task.status === "completed";
  }, [task.status]);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: ms(14),
      padding: ms(16),
      marginHorizontal: ms(20),
      marginVertical: ms(5),
      borderWidth: 1,
      borderColor: colors.border,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    checkboxTouch: {
      width: ms(24),
      height: ms(24),
      borderRadius: ms(6),
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginRight: ms(12),
      marginTop: ms(1),
    },
    contentWrap: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: fontScale(16),
      fontFamily: FONT.semiBold,
      color: colors.text,
      flex: 1,
    },
    description: {
      fontSize: fontScale(13),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      marginTop: ms(4),
      lineHeight: ms(18),
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: ms(12),
      paddingTop: ms(10),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    metaLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(8),
    },
    deadline: {
      flexDirection: "row",
      alignItems: "center",
    },
    deadlineText: {
      fontSize: fontScale(12),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
      marginLeft: ms(4),
    },
    categoryBadge: {
      paddingHorizontal: ms(8),
      paddingVertical: ms(3),
      borderRadius: ms(6),
    },
    category: {
      fontSize: fontScale(11),
      fontFamily: FONT.semiBold,
    },
    deleteBtn: {
      padding: ms(4),
    },
  }), [colors]);

  const catColor = CATEGORY_COLORS[task.category] || colors.textSecondary;

  const checkboxBg = task.status === "completed"
    ? colors.success
    : "transparent";
  const checkboxBorder = task.status === "completed"
    ? colors.success
    : colors.border;
  const checkboxIcon = task.status === "completed"
    ? "checkmark"
    : null;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => onPress?.(task)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <View style={styles.topRow}>
            <Animated.View
              style={[
                styles.checkboxTouch,
                { borderColor: checkboxBorder },
                { transform: [{ scale: scaleAnim }] },
                task.status === "completed" && { backgroundColor: colors.success },
              ]}
            >
              <Animated.View style={{ opacity: checkOpacity }}>
                <Ionicons name="checkmark" size={ms(14)} color={COLORS.white} />
              </Animated.View>
            </Animated.View>
            <View style={styles.contentWrap}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, task.status === "completed" && { textDecorationLine: "line-through", color: colors.textLight }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete?.(task)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={ms(16)} color={colors.textLight} />
                </TouchableOpacity>
              </View>
              {task.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {task.description}
                </Text>
              ) : null}
              <View style={styles.footer}>
                <StatusBadge status={task.status} />
                <View style={styles.metaLeft}>
                  {task.deadline ? (
                    <View style={styles.deadline}>
                      <Ionicons
                        name="calendar-outline"
                        size={ms(13)}
                        color={overdue ? colors.danger : colors.textLight}
                      />
                      <Text
                        style={[
                          styles.deadlineText,
                          overdue && { color: colors.danger },
                        ]}
                      >
                        {formatDate(task.deadline)}
                      </Text>
                    </View>
                  ) : null}
                  <View style={[styles.categoryBadge, { backgroundColor: withAlpha(catColor, 0.1) }]}>
                    <Text style={[styles.category, { color: catColor }]}>
                      {task.category}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
