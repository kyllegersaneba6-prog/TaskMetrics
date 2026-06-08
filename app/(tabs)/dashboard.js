import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, RefreshControl, Modal, Platform, StatusBar, Dimensions, BackHandler, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, CATEGORY_COLORS, withAlpha, moderateScale, fontScale, useIsTablet } from "../../src/utils/constants";
import { isThisWeek, formatDate } from "../../src/utils/dateHelpers";
import { useAuth } from "../../src/context/AuthContext";
import { useTasks } from "../../src/context/TasksContext";
import { useTheme } from "../../src/context/ThemeContext";
import StatusBadge from "../../src/components/StatusBadge";
import AnimatedSection from "../../src/components/AnimatedSection";
import TabBubbleOverlay from "../../src/components/TabBubbleOverlay";
import PressableBounce from "../../src/components/PressableBounce";
import BottomSheet from "../../src/components/BottomSheet";
import TaskFormSheet from "../../src/components/TaskFormSheet";
import { setHighlightId } from "../../src/utils/highlightRef";

function mixTint(hex, intensity = 0.12, toBlack = false) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c) => {
    const val = toBlack ? c * (1 - intensity) : 255 - (255 - c) * intensity;
    return Math.round(val).toString(16).padStart(2, "0");
  };
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

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
  const { colors, mode } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  const [showNotifications, setShowNotifications] = useState(false);
  const [bellOrigin, setBellOrigin] = useState(null);
  const [showTaskSheet, setShowTaskSheet] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const bellRef = useRef(null);
  const notifAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(1)).current;
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const fabTranslate = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const hasHiddenFab = useRef(false);
  const cardScale = useRef(new Animated.Value(1)).current;
  const screenDims = useMemo(() => Dimensions.get("window"), []);

  const handleOpenNotifications = useCallback(() => {
    if (bellRef.current) {
      bellRef.current.measureInWindow((x, y, width, height) => {
        setBellOrigin({ x: x + width / 2, y: y + height / 2 });
        Animated.spring(bellAnim, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }).start();
        setShowNotifications(true);
      });
    } else {
      setShowNotifications(true);
    }
  }, [bellAnim]);

  const handleCloseNotifications = useCallback(() => {
    Animated.spring(bellAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
    Animated.timing(notifAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowNotifications(false);
      setBellOrigin(null);
      clearNotifications();
    });
  }, [notifAnim, clearNotifications, bellAnim]);

  const hideFab = useCallback((callback) => {
    hasHiddenFab.current = true;
    Animated.parallel([
      Animated.timing(fabOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fabTranslate, { toValue: 40, duration: 200, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 0.5, duration: 200, useNativeDriver: true }),
    ]).start(callback);
  }, []);

  const showFab = useCallback(() => {
    if (!hasHiddenFab.current) return;
    fabOpacity.setValue(1);
    fabTranslate.setValue(0);
    fabScale.setValue(1);
  }, []);

  useEffect(() => {
    if (!showTaskSheet) return;
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      setShowTaskSheet(false);
      setEditTask(null);
      return true;
    });
    return () => handler.remove();
  }, [showTaskSheet]);

  useEffect(() => {
    if (showNotifications) {
      notifAnim.setValue(0);
      Animated.spring(notifAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [showNotifications, notifAnim]);

  const notifScale = notifAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const notifOpacity = notifAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const screenCx = screenDims.width / 2;
  const screenCy = screenDims.height / 2;
  const bellCx = bellOrigin ? bellOrigin.x : screenCx;
  const bellCy = bellOrigin ? bellOrigin.y : screenCy;
  const notifTx = notifAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bellCx - screenCx, 0],
  });
  const notifTy = notifAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bellCy - screenCy, 0],
  });

  const ms = moderateScale;
  const fs = fontScale;

  const scrollMaxH = useMemo(() => screenDims.height - ms(240), [screenDims, ms]);

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
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      padding: ms(18),
      minHeight: ms(110),
      justifyContent: "center",
      alignItems: "center",
      gap: ms(8),
      borderWidth: 1,
      borderColor: colors.border,
    },
    statCardWrapper: {
      flex: 1,
    },
    statContentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(12),
    },
    statTextGroup: {
      flexDirection: "column",
    },
    statIcon: {
      width: ms(36),
      height: ms(36),
      borderRadius: ms(10),
      justifyContent: "center",
      alignItems: "center",
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
      alignItems: "stretch",
      paddingHorizontal: ms(20),
      paddingVertical: ms(40),
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: ms(20),
      paddingTop: ms(24),
      paddingBottom: ms(32),
      width: "100%",
      maxHeight: "90%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: ms(24),
      paddingBottom: ms(20),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(10),
    },
    modalTitle: {
      fontSize: fs(22),
      fontFamily: FONT.bold,
      color: colors.text,
    },
    clearBtn: {
      backgroundColor: withAlpha(colors.text, 0.06),
      paddingHorizontal: ms(14),
      paddingVertical: ms(8),
      borderRadius: ms(10),
    },
    clearBtnText: {
      fontSize: fs(13),
      fontFamily: FONT.semiBold,
      color: colors.textSecondary,
    },
    notifItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: ms(24),
      paddingVertical: ms(16),
      gap: ms(14),
    },
    notifIcon: {
      width: ms(44),
      height: ms(44),
      borderRadius: ms(12),
      justifyContent: "center",
      alignItems: "center",
      marginTop: ms(2),
    },
    notifContent: {
      flex: 1,
    },
    notifTitle: {
      fontSize: fs(15),
      fontFamily: FONT.medium,
      color: colors.text,
      lineHeight: ms(20),
    },
    notifTitleBold: {
      fontFamily: FONT.semiBold,
    },
    notifTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: ms(6),
      gap: ms(6),
    },
    notifDot: {
      width: ms(6),
      height: ms(6),
      borderRadius: ms(3),
    },
    notifTime: {
      fontSize: fs(12),
      fontFamily: FONT.regular,
      color: colors.textLight,
    },
    notifDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: ms(24),
    },
    emptyNotif: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: ms(60),
      gap: ms(12),
    },
    emptyNotifIcon: {
      width: ms(64),
      height: ms(64),
      borderRadius: ms(20),
      backgroundColor: withAlpha(colors.textLight, 0.08),
      justifyContent: "center",
      alignItems: "center",
    },
    emptyNotifText: {
      fontSize: fs(16),
      fontFamily: FONT.semiBold,
      color: colors.text,
    },
    emptyNotifSub: {
      fontSize: fs(13),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
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

  function StatCard({ icon, label, value, color, radii }) {
    const isDark = mode === "dark";
    return (
      <PressableBounce
        style={[
          styles.statCard,
          {
            backgroundColor: mixTint(color, isDark ? 0.2 : 0.12, isDark),
            borderTopLeftRadius: radii.tl,
            borderTopRightRadius: radii.tr,
            borderBottomLeftRadius: radii.bl,
            borderBottomRightRadius: radii.br,
          },
        ]}
      >
        <View style={styles.statContentRow}>
          <View style={[styles.statIcon, { backgroundColor: withAlpha(color, isDark ? 0.35 : 0.1) }]}>
            <Ionicons name={icon} size={ms(20)} color={isDark ? "#FFFFFF" : color} />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={[styles.statValue, { color: isDark ? "#FFFFFF" : color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#FFFFFF" : colors.textSecondary }]}>{label}</Text>
          </View>
        </View>
      </PressableBounce>
    );
  }

  return (
    <View style={styles.container}>
      <TabBubbleOverlay />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity ref={bellRef} style={styles.notifBtn} onPress={handleOpenNotifications} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Animated.View style={{ transform: [{ scale: bellAnim }], opacity: bellAnim }}>
            <Ionicons name={notifications.length > 0 ? "notifications" : "notifications-outline"} size={ms(24)} color={notifications.length > 0 ? colors.danger : colors.text} />
            {notifications.length > 0 ? (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notifications.length > 9 ? "9+" : notifications.length}</Text>
              </View>
            ) : null}
          </Animated.View>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />
        }
      >
        <AnimatedSection delay={0}>
          <Text style={styles.greeting}>Welcome back, {user?.displayName?.split(" ")[0] || "User"}!</Text>
          <Text style={styles.subtitle}>Here's your task overview</Text>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <View style={styles.statsRow}>
            <View style={styles.statCardWrapper}>
              <StatCard icon="list-outline" label="Total" value={stats.total} color={colors.primary} radii={{ tl: 50, tr: 6, bl: 6, br: 6 }} />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard icon="checkmark-circle-outline" label="Completed" value={stats.completed} color={colors.success} radii={{ tl: 6, tr: 50, bl: 6, br: 6 }} />
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <View style={styles.statsRow}>
            <View style={styles.statCardWrapper}>
              <StatCard icon="time-outline" label="Pending" value={stats.pending} color={colors.warning} radii={{ tl: 6, tr: 6, bl: 50, br: 6 }} />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard icon="alert-circle-outline" label="Overdue" value={stats.overdue} color={colors.danger} radii={{ tl: 6, tr: 6, bl: 6, br: 50 }} />
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <Pressable
            onHoverIn={() => Animated.spring(cardScale, { toValue: 1.02, friction: 6, tension: 200, useNativeDriver: true }).start()}
            onHoverOut={() => Animated.spring(cardScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start()}
            onPressIn={() => Animated.spring(cardScale, { toValue: 0.98, friction: 6, tension: 200, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(cardScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start()}
          >
            <Animated.View style={[styles.productivityCard, { transform: [{ scale: cardScale }] }]}>
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
            </Animated.View>
          </Pressable>
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
                onPress={() => {
                  setHighlightId(task.id);
                  router.push("/(tabs)/tasks");
                }}
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

      <Animated.View style={[styles.fab, { opacity: fabOpacity, transform: [{ translateY: fabTranslate }, { scale: fabScale }], bottom: ms(24) + insets.bottom }]}>
        <TouchableOpacity onPress={() => hideFab(() => setShowTaskSheet(true))} activeOpacity={0.85}>
          <View style={styles.fabInner}>
            <Ionicons name="add" size={ms(26)} color={colors.background} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={showNotifications} transparent animationType="none" onRequestClose={handleCloseNotifications}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCloseNotifications}>
          <Animated.View style={{ width: "100%", opacity: notifOpacity, transform: [{ translateX: notifTx }, { translateY: notifTy }, { scale: notifScale }] }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: "100%" }}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Ionicons name="notifications" size={fs(22)} color={colors.text} />
                  <Text style={styles.modalTitle}>Notifications</Text>
                  {notifications.length > 0 ? (
                    <View style={[styles.notifBadge, { position: "relative", top: 0, right: 0 }]}>
                      <Text style={styles.notifBadgeText}>{notifications.length}</Text>
                    </View>
                  ) : null}
                </View>
                {notifications.length > 0 ? (
                  <TouchableOpacity style={styles.clearBtn} onPress={clearNotifications}>
                    <Text style={styles.clearBtnText}>Clear All</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotif}>
                  <View style={styles.emptyNotifIcon}>
                    <Ionicons name="notifications-off-outline" size={ms(28)} color={colors.textLight} />
                  </View>
                  <Text style={styles.emptyNotifText}>No notifications</Text>
                  <Text style={styles.emptyNotifSub}>You're all caught up</Text>
                </View>
              ) : (
                <View style={{ height: scrollMaxH }}>
                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {notifications.map((n, i) => {
                      const isCompleted = n.type === "completed";
                      const iconBg = withAlpha(isCompleted ? colors.success : colors.danger, 0.1);
                      const iconColor = isCompleted ? colors.success : colors.danger;
                      const dotColor = isCompleted ? colors.success : colors.danger;
                      return (
                        <View key={n.id}>
                          <View style={styles.notifItem}>
                            <View style={[styles.notifIcon, { backgroundColor: iconBg }]}>
                              <Ionicons name={isCompleted ? "checkmark-circle" : "trash"} size={ms(22)} color={iconColor} />
                            </View>
                            <View style={styles.notifContent}>
                              <Text style={styles.notifTitle} numberOfLines={2}>
                                <Text style={styles.notifTitleBold}>{n.taskTitle}</Text>
                                {" "}{isCompleted ? "completed" : "deleted"}
                              </Text>
                              <View style={styles.notifTimeRow}>
                                <View style={[styles.notifDot, { backgroundColor: dotColor }]} />
                                <Text style={styles.notifTime}>{timeAgo(n.timestamp)}</Text>
                              </View>
                            </View>
                          </View>
                          {i < notifications.length - 1 ? <View style={styles.notifDivider} /> : null}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <BottomSheet visible={showTaskSheet} onCloseStart={showFab} onClose={() => { setShowTaskSheet(false); setEditTask(null); }}>
        <TaskFormSheet key={editTask?.id || "new"} existingTask={editTask} onSaved={() => { setShowTaskSheet(false); setEditTask(null); }} onCancel={() => { setShowTaskSheet(false); setEditTask(null); }} />
      </BottomSheet>
    </View>
  );
}
