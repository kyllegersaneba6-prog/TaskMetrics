import { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, FONT, CATEGORIES, STATUSES, moderateScale, fontScale } from "../../../src/utils/constants";
import { useTasks } from "../../../src/context/TasksContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { formatDate } from "../../../src/utils/dateHelpers";
import BouncyInput from "../../../src/components/BouncyInput";

export default function TaskFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tasks, addTask, updateTask } = useTasks();
  const { colors } = useTheme();

  const editId = params.id;
  const existingTask = editId ? tasks.find((t) => t.id === editId) : null;
  const isEdit = !!existingTask;

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [category, setCategory] = useState(existingTask?.category || CATEGORIES[0]);
  const [status, setStatus] = useState(existingTask?.status || "pending");
  const [deadline, setDeadline] = useState(existingTask?.deadline ? new Date(existingTask.deadline) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const ms = moderateScale;
  const fs = fontScale;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0),
    },
    flex: {
      flex: 1,
    },
    content: {
      padding: ms(24),
      paddingBottom: ms(40),
    },
    field: {
      marginBottom: ms(22),
    },
    label: {
      fontSize: fs(13),
      fontFamily: FONT.semiBold,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: ms(8),
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(50),
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.danger,
    },
    textArea: {
      minHeight: ms(100),
      paddingTop: ms(14),
      textAlignVertical: "top",
    },
    errorText: {
      fontSize: fs(12),
      fontFamily: FONT.medium,
      color: colors.danger,
      marginTop: ms(4),
      marginLeft: ms(4),
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: ms(8),
    },
    chip: {
      paddingHorizontal: ms(16),
      paddingVertical: ms(9),
      borderRadius: ms(100),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    chipText: {
      fontSize: fs(13),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: COLORS.white,
    },
    datePicker: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(50),
      borderWidth: 1,
      borderColor: colors.border,
      gap: ms(10),
    },
    dateText: {
      flex: 1,
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.text,
    },
    datePlaceholder: {
      color: colors.textLight,
    },
    saveBtn: {
      flexDirection: "row",
      backgroundColor: colors.text,
      borderRadius: ms(12),
      minHeight: ms(52),
      justifyContent: "center",
      alignItems: "center",
      gap: ms(8),
      marginTop: ms(8),
    },
    saveBtnText: {
      fontSize: fs(16),
      fontFamily: FONT.semiBold,
      color: COLORS.white,
    },
    cancelBtn: {
      minHeight: ms(48),
      borderRadius: ms(12),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: ms(10),
    },
    cancelBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
    },
  }), [colors]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        deadline: deadline ? deadline.toISOString() : null,
      };

      if (isEdit) {
        await updateTask(editId, data);
      } else {
        await addTask(data);
      }
      Keyboard.dismiss();
      router.back();
    } catch (_) {
      setSaving(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  function FieldSection({ children, delay }) {
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FieldSection delay={0}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <BouncyInput>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter task title"
                placeholderTextColor={colors.textLight}
                value={title}
                onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: undefined })); }}
              />
            </BouncyInput>
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>
        </FieldSection>

        <FieldSection delay={80}>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <BouncyInput>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description (optional)"
                placeholderTextColor={colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </BouncyInput>
          </View>
        </FieldSection>

        <FieldSection delay={160}>
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FieldSection>

        {isEdit ? (
          <FieldSection delay={240}>
            <View style={styles.field}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.chipsRow}>
                {Object.entries(STATUSES).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, status === key && styles.chipActive]}
                    onPress={() => setStatus(key)}
                  >
                    <Text style={[styles.chipText, status === key && styles.chipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </FieldSection>
        ) : null}

        <FieldSection delay={240}>
          <View style={styles.field}>
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={fs(20)} color={colors.textSecondary} />
              <Text style={[styles.dateText, !deadline && styles.datePlaceholder]}>
                {deadline ? formatDate(deadline) : "Set a deadline (optional)"}
              </Text>
              {deadline ? (
                <TouchableOpacity onPress={() => setDeadline(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={fs(20)} color={colors.textLight} />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                accentColor={colors.primary}
              />
            )}
          </View>
        </FieldSection>

        <FieldSection delay={320}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark" size={ms(22)} color={COLORS.white} />
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : isEdit ? "Update Task" : "Add Task"}</Text>
          </TouchableOpacity>
        </FieldSection>

        <FieldSection delay={400}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { Keyboard.dismiss(); router.back(); }} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </FieldSection>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}
