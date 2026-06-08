import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, RefreshControl, Platform, StatusBar, Dimensions, ScrollView, Modal, BackHandler } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, STATUSES, withAlpha, moderateScale, fontScale } from "../../../src/utils/constants";
import { useTasks } from "../../../src/context/TasksContext";
import { useTheme } from "../../../src/context/ThemeContext";
import TaskCard from "../../../src/components/TaskCard";
import SearchBar from "../../../src/components/SearchBar";
import EmptyState from "../../../src/components/EmptyState";
import ConfirmDialog from "../../../src/components/ConfirmDialog";
import TabBubbleOverlay from "../../../src/components/TabBubbleOverlay";
import BottomSheet from "../../../src/components/BottomSheet";
import TaskFormSheet from "../../../src/components/TaskFormSheet";
import TaskDetailSheet from "../../../src/components/TaskDetailSheet";
import { consumeHighlight } from "../../../src/utils/highlightRef";
import { subscribe as subscribeTaskOpen, consumePendingTaskId } from "../../../src/utils/taskOpenRef";


export default function TaskListScreen() {
  const { tasks, deleteTask, toggleComplete } = useTasks();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showTaskSheet, setShowTaskSheet] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpRendered, setHelpRendered] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const searchIconAnim = useRef(new Animated.Value(1)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const screenDims = useMemo(() => Dimensions.get("window"), []);

  const ms = moderateScale;
  const fs = fontScale;

  const topInset = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0);

  const fabOpacity = useRef(new Animated.Value(0)).current;
  const fabTranslate = useRef(new Animated.Value(40)).current;
  const clearOpacity = useRef(new Animated.Value(0)).current;
  const clearTranslate = useRef(new Animated.Value(20)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const hasHiddenFab = useRef(false);
  const helpAnim = useRef(new Animated.Value(0)).current;

  const closeHelp = useCallback(() => {
    Animated.timing(helpAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setHelpRendered(false);
      setShowHelp(false);
    });
  }, []);

  useEffect(() => {
    if (showHelp) {
      setHelpRendered(true);
      helpAnim.setValue(0);
      Animated.spring(helpAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [showHelp]);

  useEffect(() => {
    const pendingId = consumePendingTaskId();
    if (pendingId) {
      const found = tasks.find((t) => t.id === pendingId);
      if (found) setDetailTask(found);
    }
    return subscribeTaskOpen((taskId) => {
      const found = tasks.find((t) => t.id === taskId);
      if (found) setDetailTask(found);
    });
  }, [tasks]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fabOpacity, { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.spring(fabTranslate, { toValue: 0, friction: 6, tension: 100, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

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

  const handleOpenSearch = useCallback(() => {
    if (searchRef.current) {
      searchRef.current.measureInWindow((x, y, width, height) => {
        setSearchOrigin({ x: x + width / 2, y: y + height / 2 });
        Animated.spring(searchIconAnim, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }).start();
        setShowSearch(true);
      });
    } else {
      setShowSearch(true);
    }
  }, [searchIconAnim]);

  const handleCloseSearch = useCallback(() => {
    Animated.spring(searchIconAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSearch(false);
      setSearchOrigin(null);
    });
  }, [searchAnim, searchIconAnim]);

  const handleToggleFilter = useCallback(() => {
    if (showFilter) {
      Animated.timing(filterAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowFilter(false));
    } else {
      setShowFilter(true);
      filterAnim.setValue(0);
      Animated.spring(filterAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilter, filterAnim]);

  useEffect(() => {
    if (showSearch) {
      searchAnim.setValue(0);
      Animated.spring(searchAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [showSearch, searchAnim]);

  const searchScale = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const screenCx = screenDims.width / 2;
  const screenCy = screenDims.height / 2;
  const srchOriginX = searchOrigin ? searchOrigin.x : screenCx;
  const srchOriginY = searchOrigin ? searchOrigin.y : screenCy;
  const searchTx = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [srchOriginX - screenCx, 0],
  });
  const searchTy = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [srchOriginY - screenCy, 0],
  });

  useEffect(() => {
    if (showFilter) {
      filterOptionAnims.forEach((anim, i) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 250,
          delay: 30 * i,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [showFilter, filterOptionAnims]);

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
      paddingBottom: ms(8),
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
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(12),
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
    searchOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
      zIndex: 10,
    },
    searchPanel: {
      width: "100%",
    },
    searchPanelInner: {
      marginTop: topInset + ms(16) + ms(44) + ms(8),
      backgroundColor: withAlpha(colors.primary, 0.25),
      paddingBottom: ms(4),
    },
    clearFilterWrap: {
      alignItems: "center",
      paddingVertical: ms(16),
    },
    clearFilterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(6),
      paddingHorizontal: ms(20),
      paddingVertical: ms(10),
      borderRadius: ms(10),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearFilterText: {
      fontSize: fs(13),
      fontFamily: FONT.medium,
      color: colors.text,
    },
    filterOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
    },
    filterDropdown: {
      position: "absolute",
      top: topInset + ms(16) + ms(44) + ms(4),
      right: ms(24),
      backgroundColor: colors.surface,
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: ms(180),
      paddingVertical: ms(4),
    },
    filterLabelWrap: {
      paddingHorizontal: ms(24),
      paddingTop: ms(12),
      paddingBottom: ms(4),
    },
    filterLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    filterLabel: {
      fontSize: fs(12),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
      letterSpacing: 0.3,
    },
    helpBtnSmall: {
      width: ms(20),
      height: ms(20),
      borderRadius: ms(10),
      borderWidth: 1.5,
      borderColor: colors.textSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
    helpBtnSmallText: {
      fontSize: fs(10),
      fontFamily: FONT.semiBold,
      color: colors.textSecondary,
      lineHeight: fs(11),
      marginTop: -1,
    },
    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: ms(16),
      paddingVertical: ms(12),
    },
    filterOptionText: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
    },
    helpBtn: {
      width: ms(26),
      height: ms(26),
      borderRadius: ms(13),
      borderWidth: 2,
      borderColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
    },
    helpBtnText: {
      fontSize: fs(13),
      fontFamily: FONT.semiBold,
      color: colors.text,
      lineHeight: fs(14),
      marginTop: -1,
    },
    helpOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
      paddingHorizontal: ms(24),
    },
    helpCard: {
      width: "100%",
      maxHeight: "80%",
      backgroundColor: colors.surface,
      borderRadius: ms(20),
      paddingTop: ms(28),
      paddingBottom: ms(20),
      paddingHorizontal: ms(24),
      alignItems: "center",
    },
    helpIconWrap: {
      width: ms(60),
      height: ms(60),
      borderRadius: ms(30),
      backgroundColor: withAlpha(colors.primary, 0.1),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: ms(12),
    },
    helpTitle: {
      fontSize: fs(20),
      fontFamily: FONT.bold,
      color: colors.text,
      marginBottom: ms(16),
    },
    helpScroll: {
      width: "100%",
    },
    helpStep: {
      flexDirection: "row",
      gap: ms(12),
      marginBottom: ms(16),
    },
    helpStepNum: {
      width: ms(28),
      height: ms(28),
      borderRadius: ms(14),
      backgroundColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
      marginTop: ms(2),
    },
    helpStepNumText: {
      fontSize: fs(13),
      fontFamily: FONT.semiBold,
      color: colors.background,
    },
    helpStepContent: {
      flex: 1,
    },
    helpStepTitle: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: colors.text,
      marginBottom: ms(2),
    },
    helpStepDesc: {
      fontSize: fs(13),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      lineHeight: fs(18),
    },
    helpDoneBtn: {
      marginTop: ms(8),
      backgroundColor: colors.text,
      borderRadius: ms(12),
      paddingVertical: ms(12),
      paddingHorizontal: ms(40),
    },
    helpDoneBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: colors.background,
    },
  }), [colors]);

  const statusOptions = useMemo(
    () => Object.entries(STATUSES).map(([key, label]) => ({ key, label })),
    []
  );

  const filterOptionAnimsRef = useRef([]);
  if (filterOptionAnimsRef.current.length !== statusOptions.length) {
    filterOptionAnimsRef.current = statusOptions.map(() => new Animated.Value(0));
  }
  const filterOptionAnims = filterOptionAnimsRef.current;

  const filteredTasks = useMemo(() => {
    let result = tasks || [];
    if (filter !== "all") {
      result = result.filter((t) => t.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, filter, search]);

  useEffect(() => {
    if (filteredTasks.length > 0 && (filter !== "all" || search.trim())) {
      Animated.parallel([
        Animated.timing(clearOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(clearTranslate, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      clearOpacity.setValue(0);
      clearTranslate.setValue(20);
    }
  }, [filter, search, filteredTasks.length]);

  useFocusEffect(
    useCallback(() => {
      const highlight = consumeHighlight();
      if (!highlight || !filteredTasks.length) return;

      setHighlightedId(highlight);

      const idx = filteredTasks.findIndex((t) => t.id === highlight);
      if (idx >= 0) {
        setTimeout(() => listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 }), 300);
      }
      const timer = setTimeout(() => setHighlightedId(null), 1000);
      return () => clearTimeout(timer);
    }, [filteredTasks])
  );

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

  const handleEdit = useCallback((task) => {
    setEditTask(task);
    setShowTaskSheet(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <TaskCard
        task={item}
        index={index}
        highlighted={item.id === highlightedId}
        onPress={() => setDetailTask(item)}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onToggleComplete={toggleComplete}
      />
    ),
    [highlightedId, handleEdit]
  );

  return (
    <View style={styles.container}>
      <TabBubbleOverlay />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity ref={filterRef} onPress={handleToggleFilter} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={filter !== "all" ? "funnel" : "funnel-outline"}
              size={ms(22)}
              color={filter !== "all" ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <Animated.View style={{ opacity: searchIconAnim, transform: [{ scale: searchIconAnim }] }}>
            <TouchableOpacity ref={searchRef} onPress={handleOpenSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="search-outline" size={ms(24)} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScrollToIndexFailed={() => {}}

        contentContainerStyle={filteredTasks.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={filteredTasks.length > 0 ? (
          <View style={styles.filterLabelWrap}>
            <View style={styles.filterLabelRow}>
              <Text style={styles.filterLabel}>
                {filter !== "all" || search.trim()
                  ? [
                      filter !== "all" ? `Filter: ${STATUSES[filter] || filter}` : null,
                      search.trim() ? `Search: "${search}" — ${filteredTasks.length} ${filteredTasks.length === 1 ? "result" : "results"}` : null,
                    ].filter(Boolean).join(" • ")
                  : "All Tasks"}
              </Text>
              {filter === "all" && !search.trim() && (
                <TouchableOpacity onPress={() => setShowHelp(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <View style={styles.helpBtnSmall}>
                    <Text style={styles.helpBtnSmallText}>?</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}
        ListEmptyComponent={
          search || filter !== "all" ? (
            <EmptyState
              icon="search-outline"
              title="No tasks found"
              message="Try a different search or filter"
              action={
                <TouchableOpacity style={styles.clearFilterBtn} onPress={() => { setFilter("all"); setSearch(""); }}>
                  <Ionicons name="close-outline" size={ms(16)} color={colors.text} />
                  <Text style={styles.clearFilterText}>
                    {filter !== "all" && search.trim() ? "Clear filters" : "Remove filter"}
                  </Text>
                </TouchableOpacity>
              }
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No tasks yet"
              message="Tap + to create your first task"
            />
          )
        }
        ListFooterComponent={filteredTasks.length > 0 && (filter !== "all" || search.trim()) ? (
          <Animated.View style={[styles.clearFilterWrap, { opacity: clearOpacity, transform: [{ translateY: clearTranslate }] }]}>
            <TouchableOpacity style={styles.clearFilterBtn} onPress={() => { setFilter("all"); setSearch(""); }}>
              <Ionicons name="close-outline" size={ms(16)} color={colors.text} />
              <Text style={styles.clearFilterText}>
                {filter !== "all" && search.trim() ? "Clear filters" : "Remove filter"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      />

      <Animated.View style={[styles.fab, { opacity: fabOpacity, transform: [{ translateY: fabTranslate }, { scale: fabScale }], bottom: ms(24) + insets.bottom }]}>
        <TouchableOpacity onPress={() => hideFab(() => setShowTaskSheet(true))} activeOpacity={0.85}>
          <View style={styles.fabInner}>
            <Ionicons name="add" size={ms(26)} color={colors.background} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {showSearch && (
        <TouchableOpacity style={styles.searchOverlay} activeOpacity={1} onPress={handleCloseSearch}>
          <Animated.View
            style={[
              styles.searchPanel,
              {
                opacity: searchOpacity,
                transform: [
                  { translateX: searchTx },
                  { translateY: searchTy },
                  { scale: searchScale },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.searchPanelInner}>
                <SearchBar value={search} onChangeText={setSearch} autoFocus />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {showFilter && (
        <TouchableOpacity style={styles.filterOverlay} activeOpacity={1} onPress={() => {
          Animated.timing(filterAnim, {
            toValue: 0, duration: 200, useNativeDriver: true,
          }).start(() => setShowFilter(false));
        }}>
          <Animated.View
            style={[
              styles.filterDropdown,
              {
                opacity: filterAnim,
                transform: [{ scale: filterAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              {statusOptions.map((opt, i) => (
                <Animated.View
                  key={opt.key}
                  style={{
                    opacity: filterOptionAnims[i],
                    transform: [{ translateY: filterOptionAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
                  }}
                >
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filter === opt.key && { backgroundColor: withAlpha(colors.primary, 0.1) },
                  ]}
                  onPress={() => { setFilter(opt.key); handleToggleFilter(); }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: filter === opt.key ? colors.primary : colors.text },
                      filter === opt.key && { fontFamily: FONT.semiBold },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {filter === opt.key && (
                    <Ionicons name="checkmark" size={ms(16)} color={colors.primary} />
                  )}
                </TouchableOpacity>
                </Animated.View>
              ))}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      <TaskDetailSheet
        task={detailTask}
        visible={!!detailTask}
        onClose={() => setDetailTask(null)}
        onToggleComplete={toggleComplete}
        onEdit={handleEdit}
        onDelete={deleteTask}
      />

      <Modal visible={helpRendered} transparent animationType="none" onRequestClose={closeHelp}>
        <Animated.View style={[styles.helpOverlay, { opacity: helpAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeHelp} />
          <Animated.View
            style={[
              styles.helpCard,
              { transform: [{ scale: helpAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
            ]}
          >
            <View style={styles.helpIconWrap}>
              <Ionicons name="information-circle" size={ms(36)} color={colors.primary} />
            </View>
            <Text style={styles.helpTitle}>How to Use TaskMetrics</Text>
            <ScrollView style={styles.helpScroll} showsVerticalScrollIndicator={false}>
              {[
                { step: "Create a Task", desc: 'Tap the + button at the bottom right. Fill in the title, description, category, and deadline, then tap "Add Task".' },
                { step: "View & Edit", desc: "Tap any task card to see details. Tap the edit icon to modify title, status, or deadline." },
                { step: "Complete a Task", desc: "Tap the checkbox on a task card to mark it as complete. Tap again to reopen." },
                { step: "Search & Filter", desc: "Use the search icon to find tasks by title. Use the funnel icon to filter by status (All, Pending, Completed, Overdue)." },
                { step: "Delete a Task", desc: "Tap the delete icon on a task card to remove it. A confirmation dialog will appear." },
              ].map((item, i) => (
                <View key={i} style={styles.helpStep}>
                  <View style={styles.helpStepNum}>
                    <Text style={styles.helpStepNumText}>{i + 1}</Text>
                  </View>
                  <View style={styles.helpStepContent}>
                    <Text style={styles.helpStepTitle}>{item.step}</Text>
                    <Text style={styles.helpStepDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.helpDoneBtn} onPress={closeHelp}>
              <Text style={styles.helpDoneBtnText}>Got it</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <BottomSheet visible={showTaskSheet} onCloseStart={showFab} onClose={() => { setShowTaskSheet(false); setEditTask(null); }}>
        <TaskFormSheet key={editTask?.id || "new"} existingTask={editTask} onSaved={() => { setShowTaskSheet(false); setEditTask(null); }} onCancel={() => { setShowTaskSheet(false); setEditTask(null); }} />
      </BottomSheet>
    </View>
  );
}
