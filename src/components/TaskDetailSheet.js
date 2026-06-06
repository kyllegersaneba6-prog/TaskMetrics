import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Animated, PanResponder, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, CATEGORY_COLORS, withAlpha, moderateScale, fontScale } from "../utils/constants";
import { formatDate, isOverdue } from "../utils/dateHelpers";
import { useTheme } from "../context/ThemeContext";
import StatusBadge from "./StatusBadge";
import ConfirmDialog from "./ConfirmDialog";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TaskDetailSheet({ task, visible, onClose, onToggleComplete, onEdit, onDelete }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const sheetHeight = useRef(0);
  const dragYValue = useRef(0);

  const ms = moderateScale;
  const fs = fontScale;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      dragY.setValue(0);
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const animatedTranslate = Animated.add(translateY, dragY);

  const close = useCallback(() => {
    dragY.setValue(0);
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose?.());
  }, [onClose]);

  const sheetPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
    onPanResponderMove: (_, gs) => {
      if (gs.dy > 0) {
        dragY.setValue(gs.dy);
        dragYValue.current = gs.dy;
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > (sheetHeight.current || SCREEN_HEIGHT * 0.5) * 0.2) {
        translateY.setValue(dragYValue.current);
        dragY.setValue(0);
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onClose?.());
      } else {
        Animated.spring(dragY, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }).start();
        dragYValue.current = 0;
      }
    },
  }), [onClose]);

  const overdue = task && isOverdue(task.deadline) && task.status !== "completed";
  const catColor = task ? CATEGORY_COLORS[task.category] || colors.textSecondary : colors.textSecondary;

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: ms(20),
      borderTopRightRadius: ms(20),
      maxHeight: SCREEN_HEIGHT * 0.88,
      paddingBottom: insets.bottom + ms(8),
    },
    handleWrap: {
      alignItems: "center",
      paddingTop: ms(10),
      paddingBottom: ms(4),
    },
    handle: {
      width: ms(36),
      height: ms(5),
      borderRadius: ms(2.5),
      backgroundColor: colors.textLight,
    },
    scroll: {
      paddingTop: ms(8),
    },
    content: {
      paddingHorizontal: ms(24),
    },
    pillsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(10),
      marginBottom: ms(14),
    },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: ms(12),
      paddingVertical: ms(5),
      borderRadius: ms(100),
    },
    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(6),
    },
    categoryDot: {
      width: ms(6),
      height: ms(6),
      borderRadius: ms(3),
    },
    categoryText: {
      fontSize: fs(12),
      fontFamily: FONT.semiBold,
      color: COLORS.white,
    },
    title: {
      fontSize: fs(24),
      fontFamily: FONT.extraBold,
      color: colors.text,
      lineHeight: ms(32),
      letterSpacing: -0.3,
      marginBottom: ms(20),
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    sectionWrap: {
      paddingHorizontal: ms(24),
      paddingTop: ms(16),
      paddingBottom: ms(16),
    },
    sectionLabel: {
      fontSize: fs(11),
      fontFamily: FONT.semiBold,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: ms(6),
    },
    descriptionText: {
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.text,
      lineHeight: ms(22),
    },
    deadlineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(8),
    },
    deadlineValue: {
      fontSize: fs(15),
      fontFamily: FONT.medium,
      color: colors.text,
    },
    overdueBadge: {
      backgroundColor: withAlpha(colors.danger, 0.1),
      borderRadius: ms(100),
      paddingHorizontal: ms(8),
      paddingVertical: ms(3),
    },
    overdueText: {
      fontSize: fs(12),
      fontFamily: FONT.semiBold,
      color: colors.danger,
    },
    timelineText: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
      color: colors.text,
      marginBottom: ms(3),
    },
    actionsWrap: {
      paddingHorizontal: ms(24),
      paddingTop: ms(16),
      gap: ms(10),
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(8),
      paddingVertical: ms(14),
      borderRadius: ms(14),
    },
    completeBtn: {
      backgroundColor: colors.success,
    },
    uncompleteBtn: {
      backgroundColor: colors.warning,
    },
    actionBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: COLORS.white,
    },
    secondaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(8),
      paddingVertical: ms(14),
      borderRadius: ms(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: colors.text,
    },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(8),
      paddingVertical: ms(14),
      borderRadius: ms(14),
      borderWidth: 1,
      borderColor: withAlpha(colors.danger, 0.15),
    },
    deleteBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: colors.danger,
    },
  }), [colors]);

  if (!task) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: animatedTranslate }] }]}
            onLayout={(e) => { sheetHeight.current = e.nativeEvent.layout.height; }}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.handleWrap} {...sheetPanResponder.panHandlers}>
                <View style={styles.handle} />
              </View>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.content}>
                  <View style={styles.pillsRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
                      <View style={styles.categoryRow}>
                        <View style={[styles.categoryDot, { backgroundColor: COLORS.white }]} />
                        <Text style={styles.categoryText}>{task.category}</Text>
                      </View>
                    </View>
                    <StatusBadge status={task.status} />
                  </View>

                  <Text style={styles.title}>{task.title}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.sectionWrap}>
                  <Text style={styles.sectionLabel}>Description</Text>
                  <Text style={[styles.descriptionText, !task.description && { color: colors.textLight }]}>
                    {task.description || "No description"}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.sectionWrap}>
                  <Text style={styles.sectionLabel}>Deadline</Text>
                  <View style={styles.deadlineRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={fs(18)}
                      color={overdue ? colors.danger : colors.textSecondary}
                    />
                    <Text style={[styles.deadlineValue, overdue && { color: colors.danger }]}>
                      {task.deadline ? formatDate(task.deadline) : "No deadline set"}
                    </Text>
                    {overdue ? (
                      <View style={styles.overdueBadge}>
                        <Text style={styles.overdueText}>Overdue</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.sectionWrap}>
                  <Text style={styles.sectionLabel}>Timeline</Text>
                  <Text style={styles.timelineText}>
                    Created: {formatDate(task.createdAt)}
                  </Text>
                  <Text style={styles.timelineText}>
                    Updated: {formatDate(task.updatedAt)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.actionsWrap}>
                  <TouchableOpacity
                    style={[styles.actionBtn, task.status === "completed" ? styles.uncompleteBtn : styles.completeBtn]}
                    onPress={() => { onClose(); onToggleComplete?.(task.id, task.status); }}
                  >
                    <Ionicons
                      name={task.status === "completed" ? "refresh-outline" : "checkmark-circle-outline"}
                      size={ms(20)}
                      color={COLORS.white}
                    />
                    <Text style={styles.actionBtnText}>
                      {task.status === "completed" ? "Reopen Task" : "Mark Complete"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => { onClose(); onEdit?.(task); }}>
                    <Ionicons name="create-outline" size={ms(20)} color={colors.text} />
                    <Text style={styles.secondaryBtnText}>Edit Task</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
                    <Ionicons name="trash-outline" size={ms(20)} color={colors.danger} />
                    <Text style={styles.deleteBtnText}>Delete Task</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: ms(8) }} />
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        onConfirm={() => { setShowDeleteConfirm(false); onClose(); onDelete?.(task.id); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
