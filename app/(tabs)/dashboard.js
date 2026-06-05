import { useMemo, useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, RefreshControl, Modal, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, CATEGORY_COLORS, withAlpha, moderateScale, fontScale, useIsTablet } from "../../src/utils/constants";
import { isThisWeek, formatDate } from "../../src/utils/dateHelpers";
import { useTasks } from "../../src/context/TasksContext";
import { useTheme } from "../../src/context/ThemeContext";
import StatusBadge from "../../src/components/StatusBadge";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { tasks, notifications, clearNotifications } = useTasks();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  const [showNotifications, setShowNotifications] = useState(false);

  const ms = moderateScale;
  const fs = fontScale;

  const topInset = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: topInset + ms(16),
      paddingBottom: ms(12),
      paddingHorizontal: ms(24),
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: fs(30),
      fontFamily: FONT.extraBold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    notifBtn: {
      position: "relative",
      padding: ms(4),
    },
    notifBadge: {
      position: "absolute",
      top: ms(-2),
      right: ms(-2),
      backgroundColor: colors.danger,
      borderRadius: ms(9),
      width: ms(18),
      height: ms(18),
      justifyContent: "center",
      alignItems: "center",
    },
    notifBadgeText: {
      fontSize: fs(10),
      fontFamily: FONT.bold,
      color: COLORS.white,
    },
    content: {
      padding: ms(24),
      paddingTop: ms(8),
      paddingBottom: ms(40),
    },
    greeting: {
      fontSize: fs(18),
      fontFamily: FONT.semiBold,
      color: colors.text,
    },
    subtitle: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      marginBottom: ms(24),
      marginTop: ms(2),
    },
    statsRow: {
      flexDirection: "row",
      gap: ms(12),
      marginBottom: ms(12),
    },
    statCard: {
      flex: 1,
      borderRadius: ms(16),
      padding: ms(18),
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      width: ms(36),
      height: ms(36),
      borderRadius: ms(10),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: ms(10),
    },
    statValue: {
      fontSize: fs(26),
      fontFamily: FONT.extraBold,
      color: colors.text,
    },
    statLabel: {
      fontSize: fs(12),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
      marginTop: ms(2),
    },
    productivityCard: {
      backgroundColor: colors.surface,
      borderRadius: ms(16),
      padding: ms(20),
      marginBottom: ms(24),
      borderWidth: 1,
      borderColor: colors.border,
    },
    productivityHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: ms(16),
    },
    sectionTitle: {
      fontSize: fs(16),
      fontFamily: FONT.semiBold,
      color: colors.text,
    },
    rateRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: ms(4),
    },
    rateValue: {
      fontSize: fs(22),
      fontFamily: FONT.extraBold,
      color: colors.primary,
    },
    rateLabel: {
      fontSize: fs(12),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
    },
    barContainer: {
      gap: ms(8),
    },
    barBg: {
      height: ms(8),
      backgroundColor: colors.border,
      borderRadius: ms(4),
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: ms(4),
    },
    barLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    barLabelText: {
      fontSize: fs(12),
      fontFamily: FONT.regular,
      color: colors.textLight,
    },
    recentSection: {
      marginBottom: ms(16),
    },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: ms(14),
    },
    seeAll: {
      fontSize: fs(14),
      fontFamily: FONT.semiBold,
      color: colors.primary,
    },
    recentItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: ms(16),
      borderRadius: ms(14),
      marginBottom: ms(8),
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: ms(12),
    },
    recentItemDot: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      marginRight: ms(10),
    },
    recentItemTitle: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: colors.text,
      flex: 1,
    },
    recentItemCategory: {
      fontSize: fs(12),
      fontFamily: FONT.regular,
      color: colors.textLight,
      marginTop: ms(2),
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: ms(24),
      paddingVertical: ms(40),
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: ms(20),
      paddingTop: ms(24),
      paddingBottom: ms(32),
      width: "100%",
      maxWidth: isTablet ? ms(500) : "90%",
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: ms(24),
      marginBottom: ms(16),
    },
    modalTitle: {
      fontSize: fs(20),
      fontFamily: FONT.bold,
      color: colors.text,
    },
    notifItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: ms(24),
      paddingVertical: ms(14),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notifContent: {
      flex: 1,
      marginLeft: ms(12),
    },
    notifIcon: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(12),
      justifyContent: "center",
      alignItems: "center",
    },
    notifTitle: {
      fontSize: fs(14),
      fontFamily: FONT.medium,
      color: colors.text,
      lineHeight: ms(20),
    },
    notifTime: {
      fontSize: fs(12),
      fontFamily: FONT.regular,
      color: colors.textLight,
      marginTop: ms(2),
    },
    emptyNotif: {
      alignItems: "center",
      paddingVertical: ms(32),
    },
    emptyNotifText: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      marginTop: ms(8),
    },
    fab: {
      position: "absolute",
      right: ms(24),
      bottom: ms(24),
    },
    fabInner: {
      width: ms(52),
      height: ms(52),
      borderRadius: ms(16),
      backgroundColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
    },
  }), [colors, isTablet]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date()
    ).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, isTablet ? 8 : 5);
  }, [tasks, isTablet]);

  const weeklyCompleted = useMemo(() => {
    return tasks.filter((t) => t.status === "completed" && isThisWeek(t.updatedAt)).length;
  }, [tasks]);

  const weeklyTotal = useMemo(() => {
    return tasks.filter((t) => isThisWeek(t.updatedAt) || isThisWeek(t.createdAt)).length;
  }, [tasks]);

  const completionRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  function AnimatedSection({ children, delay = 0 }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      ]).start();
    }, []);
    return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
  }

  function StatCard({ icon, label, value, color, bg }) {
    return (
      <View style={[styles.statCard, { backgroundColor: bg }]}>
        <View style={[styles.statIcon, { backgroundColor: withAlpha(color, 0.1) }]}>
          <Ionicons name={icon} size={ms(20)} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifications(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={notifications.length > 0 ? "notifications" : "notifications-outline"} size={ms(24)} color={notifications.length > 0 ? colors.danger : colors.text} />
          {notifications.length > 0 ? (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{notifications.length > 9 ? "9+" : notifications.length}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />
        }
      >
        <AnimatedSection delay={0}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitle}>Here's your task overview</Text>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <View style={[styles.statsRow, isTablet && { flexWrap: "wrap" }]}>
            <StatCard icon="list-outline" label="Total" value={stats.total} color={colors.primary} bg={withAlpha(colors.primary, 0.04)} />
            <StatCard icon="checkmark-circle-outline" label="Completed" value={stats.completed} color={colors.success} bg={withAlpha(colors.success, 0.04)} />
          </View>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <View style={[styles.statsRow, isTablet && { flexWrap: "wrap" }]}>
            <StatCard icon="time-outline" label="Pending" value={stats.pending} color={colors.warning} bg={withAlpha(colors.warning, 0.04)} />
            <StatCard icon="alert-circle-outline" label="Overdue" value={stats.overdue} color={colors.danger} bg={withAlpha(colors.danger, 0.04)} />
          </View>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <View style={styles.productivityCard}>
            <View style={styles.productivityHeader}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.rateRow}>
                <Text style={styles.rateValue}>{completionRate}%</Text>
                <Text style={styles.rateLabel}>completion rate</Text>
              </View>
            </View>
            <View style={styles.barContainer}>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${completionRate}%` }]} />
              </View>
              <View style={styles.barLabels}>
                <Text style={styles.barLabelText}>{weeklyCompleted} completed</Text>
                <Text style={styles.barLabelText}>{weeklyTotal} total</Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Tasks</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/tasks")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentTasks.map((task) => {
              const catColor = CATEGORY_COLORS[task.category] || "#666666";
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.recentItem}
                onPress={() => router.push(`/(tabs)/tasks/${task.id}`)}
              >
                <View style={styles.recentItemLeft}>
                  <View style={[styles.recentItemDot, { backgroundColor: catColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentItemTitle} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={styles.recentItemCategory}>{task.category}</Text>
                  </View>
                </View>
                <StatusBadge status={task.status} />
              </TouchableOpacity>
            );
          })}
        </View>
      </AnimatedSection>
      </ScrollView>

      <TouchableOpacity style={[styles.fab]} onPress={() => router.push("/(tabs)/tasks/add")} activeOpacity={0.85}>
        <View style={styles.fabInner}>
          <Ionicons name="add" size={ms(26)} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => { setShowNotifications(false); clearNotifications(); }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Activity</Text>
                <TouchableOpacity onPress={clearNotifications}>
                  <Text style={{ fontSize: fs(13), fontFamily: FONT.semiBold, color: colors.primary }}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotif}>
                  <Ionicons name="notifications-off-outline" size={ms(48)} color={colors.textLight} />
                  <Text style={styles.emptyNotifText}>No recent activity</Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: ms(400) }}>
                  {notifications.map((n) => {
                    const isCompleted = n.type === "completed";
                    return (
                      <View key={n.id} style={styles.notifItem}>
                        <View style={[styles.notifIcon, { backgroundColor: withAlpha(isCompleted ? colors.success : colors.danger, 0.1) }]}>
                          <Ionicons name={isCompleted ? "checkmark-circle" : "trash"} size={ms(20)} color={isCompleted ? colors.success : colors.danger} />
                        </View>
                        <View style={styles.notifContent}>
                          <Text style={styles.notifTitle} numberOfLines={1}>
                            <Text style={{ fontFamily: FONT.bold }}>{n.taskTitle}</Text>
                            {" "}{isCompleted ? "completed" : "deleted"}
                          </Text>
                          <Text style={styles.notifTime}>{timeAgo(n.timestamp)}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
