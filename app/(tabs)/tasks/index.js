import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, RefreshControl, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, STATUSES, moderateScale, fontScale } from "../../../src/utils/constants";
import { useTasks } from "../../../src/context/TasksContext";
import { useTheme } from "../../../src/context/ThemeContext";
import TaskCard from "../../../src/components/TaskCard";
import SearchBar from "../../../src/components/SearchBar";
import FilterChips from "../../../src/components/FilterChips";
import EmptyState from "../../../src/components/EmptyState";
import ConfirmDialog from "../../../src/components/ConfirmDialog";
import { useFadeIn } from "../../../src/animations/entrance";

export default function TaskListScreen() {
  const router = useRouter();
  const { tasks, deleteTask } = useTasks();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const ms = moderateScale;
  const fs = fontScale;

  const topInset = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0);

  const headerOpacity = useFadeIn(0);
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const fabTranslate = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fabOpacity, { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.spring(fabTranslate, { toValue: 0, friction: 6, tension: 100, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: topInset + ms(16),
      paddingBottom: ms(8),
      paddingHorizontal: ms(24),
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: fs(30),
      fontFamily: FONT.extraBold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    list: {
      paddingBottom: ms(100),
    },
    emptyContainer: {
      flexGrow: 1,
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
  }), [colors]);

  const statusOptions = useMemo(
    () => Object.entries(STATUSES).map(([key, label]) => ({ key, label })),
    []
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter !== "all") {
      result = result.filter((t) => t.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, filter, search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
    } catch (_) {}
    setDeleteTarget(null);
  }, [deleteTarget, deleteTask]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <TaskCard
        task={item}
        index={index}
        onPress={() => router.push(`/(tabs)/tasks/${item.id}`)}
        onDelete={setDeleteTarget}
      />
    ),
    [router]
  );

  const renderListHeader = () => (
    <Animated.View style={{ opacity: headerOpacity }}>
      <SearchBar value={search} onChangeText={setSearch} />
      <FilterChips options={statusOptions} selected={filter} onSelect={setFilter} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={filteredTasks.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={search || filter !== "all" ? "No tasks found" : "No tasks yet"}
            message={search || filter !== "all" ? "Try a different search or filter" : "Tap + to create your first task"}
          />
        }
      />

      <Animated.View style={[styles.fab, { opacity: fabOpacity, transform: [{ translateY: fabTranslate }], bottom: ms(24) + insets.bottom }]}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/tasks/add")} activeOpacity={0.85}>
          <View style={styles.fabInner}>
            <Ionicons name="add" size={ms(26)} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
