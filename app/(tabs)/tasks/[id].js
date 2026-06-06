import { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { COLORS, FONT, CATEGORY_COLORS, withAlpha, moderateScale, fontScale } from "../../../src/utils/constants";
import { formatDate, isOverdue } from "../../../src/utils/dateHelpers";
import { useTasks } from "../../../src/context/TasksContext";
import { useTheme } from "../../../src/context/ThemeContext";
import StatusBadge from "../../../src/components/StatusBadge";
import ConfirmDialog from "../../../src/components/ConfirmDialog";
import AnimatedSection from "../../../src/components/AnimatedSection";
import BottomSheet from "../../../src/components/BottomSheet";
import TaskFormSheet from "../../../src/components/TaskFormSheet";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { tasks, deleteTask, toggleComplete } = useTasks();
  const { colors } = useTheme();
  const task = tasks.find((t) => t.id === id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;
    parent.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const ms = moderateScale;
  const fs = fontScale;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    notFound: {
      fontSize: fs(16),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
    },
    scroll: {
      paddingBottom: ms(40),
    },
    headerSection: {
      paddingHorizontal: ms(24),
      paddingTop: ms(8),
      paddingBottom: ms(4),
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
      fontSize: fs(26),
      fontFamily: FONT.extraBold,
      color: colors.text,
      lineHeight: ms(34),
      letterSpacing: -0.3,
      marginBottom: ms(24),
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: ms(24),
    },
    sectionWrap: {
      paddingHorizontal: ms(24),
      paddingVertical: ms(20),
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
      paddingTop: ms(24),
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

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Task not found</Text>
      </View>
    );
  }

  const overdue = isOverdue(task.deadline) && task.status !== "completed";
  const catColor = CATEGORY_COLORS[task.category] || colors.textSecondary;

  const handleDelete = async () => {
    try {
      await deleteTask(id);
    } catch (_) {}
    setShowDeleteConfirm(false);
    router.back();
  };

  const handleToggleComplete = () => {
    toggleComplete(id, task.status);
  };

  function Section({ children, delay }) {
    return <AnimatedSection delay={delay} duration={350}>{children}</AnimatedSection>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section delay={0}>
          <View style={styles.headerSection}>
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
        </Section>

        <View style={styles.divider} />

        {task.description ? (
          <Section delay={80}>
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          </Section>
        ) : (
          <Section delay={80}>
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={[styles.descriptionText, { color: colors.textLight }]}>No description</Text>
            </View>
          </Section>
        )}

        <View style={styles.divider} />

        <Section delay={130}>
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
        </Section>

        <View style={styles.divider} />

        <Section delay={180}>
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            <Text style={styles.timelineText}>
              Created: {formatDate(task.createdAt)}
            </Text>
            <Text style={styles.timelineText}>
              Updated: {formatDate(task.updatedAt)}
            </Text>
          </View>
        </Section>

        <View style={styles.divider} />

        <Section delay={220}>
          <View style={styles.actionsWrap}>
            <TouchableOpacity
              style={[styles.actionBtn, task.status === "completed" ? styles.uncompleteBtn : styles.completeBtn]}
              onPress={handleToggleComplete}
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

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowEditSheet(true)}>
              <Ionicons name="create-outline" size={ms(20)} color={colors.text} />
              <Text style={styles.secondaryBtnText}>Edit Task</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
              <Ionicons name="trash-outline" size={ms(20)} color={colors.danger} />
              <Text style={styles.deleteBtnText}>Delete Task</Text>
            </TouchableOpacity>
          </View>
        </Section>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <BottomSheet visible={showEditSheet} onClose={() => setShowEditSheet(false)}>
        <TaskFormSheet key={task?.id || "edit"} existingTask={task} onSaved={() => setShowEditSheet(false)} onCancel={() => setShowEditSheet(false)} />
      </BottomSheet>
    </View>
  );
}
