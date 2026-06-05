import { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, CATEGORY_COLORS, withAlpha, moderateScale, fontScale } from "../../../src/utils/constants";
import { formatDate, isOverdue } from "../../../src/utils/dateHelpers";
import { useTasks } from "../../../src/context/TasksContext";
import { useTheme } from "../../../src/context/ThemeContext";
import StatusBadge from "../../../src/components/StatusBadge";
import ConfirmDialog from "../../../src/components/ConfirmDialog";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, deleteTask, toggleComplete } = useTasks();
  const { colors } = useTheme();
  const task = tasks.find((t) => t.id === id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const insets = useSafeAreaInsets();

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
    content: {
      padding: ms(24),
      paddingBottom: ms(40),
    },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: ms(12),
      paddingVertical: ms(5),
      borderRadius: ms(100),
      marginBottom: ms(14),
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
      marginBottom: ms(10),
      lineHeight: ms(34),
      letterSpacing: -0.3,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: ms(24),
      gap: ms(10),
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: ms(14),
      padding: ms(18),
      marginBottom: ms(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionLabel: {
      fontSize: fs(12),
      fontFamily: FONT.semiBold,
      color: colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: ms(8),
    },
    description: {
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
    deadlineText: {
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
      color: colors.textSecondary,
      marginBottom: ms(4),
    },
    actionBtn: {
      flexDirection: "row",
      minHeight: ms(50),
      borderRadius: ms(12),
      justifyContent: "center",
      alignItems: "center",
      gap: ms(8),
      marginBottom: ms(10),
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
    editBtn: {
      flexDirection: "row",
      minHeight: ms(50),
      borderRadius: ms(12),
      justifyContent: "center",
      alignItems: "center",
      gap: ms(8),
      marginBottom: ms(10),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    editBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: colors.text,
    },
    deleteBtn: {
      flexDirection: "row",
      minHeight: ms(50),
      borderRadius: ms(12),
      justifyContent: "center",
      alignItems: "center",
      gap: ms(8),
      borderWidth: 1,
      borderColor: withAlpha(colors.danger, 0.15),
      backgroundColor: withAlpha(colors.danger, 0.04),
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

  const handleEdit = () => {
    router.push({
      pathname: "/(tabs)/tasks/add",
      params: { id },
    });
  };

  function Section({ children, delay }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
      ]).start();
    }, []);
    return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section delay={0}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: COLORS.white }]} />
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{task.title}</Text>

          <View style={styles.metaRow}>
            <StatusBadge status={task.status} />
          </View>
        </Section>

        {task.description ? (
          <Section delay={100}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          </Section>
        ) : null}

        <Section delay={150}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Deadline</Text>
            <View style={styles.deadlineRow}>
              <Ionicons
                name="calendar-outline"
                size={fs(20)}
                color={overdue ? colors.danger : colors.textSecondary}
              />
              <Text style={[styles.deadlineText, overdue && { color: colors.danger }]}>
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

        <Section delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            <Text style={styles.timelineText}>
              Created: {formatDate(task.createdAt)}
            </Text>
            <Text style={styles.timelineText}>
              Updated: {formatDate(task.updatedAt)}
            </Text>
          </View>
        </Section>

        <Section delay={250}>
          <TouchableOpacity
            style={[styles.actionBtn, task.status === "completed" ? styles.uncompleteBtn : styles.completeBtn]}
            onPress={handleToggleComplete}
          >
            <Ionicons
              name={task.status === "completed" ? "refresh-outline" : "checkmark-circle-outline"}
              size={ms(22)}
              color={COLORS.white}
            />
            <Text style={styles.actionBtnText}>
              {task.status === "completed" ? "Reopen Task" : "Mark Complete"}
            </Text>
          </TouchableOpacity>
        </Section>

        <Section delay={300}>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={ms(22)} color={colors.text} />
            <Text style={styles.editBtnText}>Edit Task</Text>
          </TouchableOpacity>
        </Section>

        <Section delay={350}>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
            <Ionicons name="trash-outline" size={ms(22)} color={colors.danger} />
            <Text style={styles.deleteBtnText}>Delete Task</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}
