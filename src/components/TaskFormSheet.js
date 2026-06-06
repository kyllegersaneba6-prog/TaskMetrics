import { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, CATEGORIES, STATUSES, moderateScale, fontScale } from "../utils/constants";
import { useTasks } from "../context/TasksContext";
import { useTheme } from "../context/ThemeContext";
import { formatDate } from "../utils/dateHelpers";
import { SOUND_OPTIONS } from "../services/notifications";
import BouncyInput from "./BouncyInput";
import DropdownPicker from "./DropdownPicker";

let DateTimePicker = null;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch (_) {
  DateTimePicker = null;
}

export default function TaskFormSheet({ existingTask, onSaved, onCancel }) {
  const { addTask, updateTask } = useTasks();
  const { colors } = useTheme();

  const isEdit = !!existingTask;

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [category, setCategory] = useState(existingTask?.category || CATEGORIES[0]);
  const [status, setStatus] = useState(existingTask?.status || "pending");
  const [deadline, setDeadline] = useState(existingTask?.deadline ? new Date(existingTask.deadline) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remindMe, setRemindMe] = useState(!!existingTask?.reminderAt);
  const [reminderDate, setReminderDate] = useState(existingTask?.reminderAt ? new Date(existingTask.reminderAt) : null);
  const [reminderTime, setReminderTime] = useState(existingTask?.reminderAt ? new Date(existingTask.reminderAt) : null);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [soundName, setSoundName] = useState(existingTask?.soundName || "default");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const ms = moderateScale;
  const fs = fontScale;

  const styles = useMemo(() => StyleSheet.create({
    scroll: {
      paddingHorizontal: ms(24),
      paddingTop: ms(4),
      paddingBottom: ms(24),
    },
    field: {
      marginBottom: ms(20),
    },
    label: {
      fontSize: fs(12),
      fontFamily: FONT.semiBold,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: ms(6),
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(48),
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
      minHeight: ms(80),
      paddingTop: ms(12),
      textAlignVertical: "top",
    },
    errorText: {
      fontSize: fs(11),
      fontFamily: FONT.medium,
      color: colors.danger,
      marginTop: ms(3),
      marginLeft: ms(4),
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: ms(8),
    },
    chip: {
      paddingHorizontal: ms(14),
      paddingVertical: ms(8),
      borderRadius: ms(100),
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    chipText: {
      fontSize: fs(12),
      fontFamily: FONT.medium,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: COLORS.white,
    },
    datePicker: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(48),
      borderWidth: 1,
      borderColor: colors.border,
      gap: ms(8),
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
      minHeight: ms(50),
      justifyContent: "center",
      alignItems: "center",
      gap: ms(8),
    },
    saveBtnText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
      color: COLORS.white,
    },
    toggleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(48),
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleLabel: {
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.text,
    },
    reminderPickers: {
      flexDirection: "row",
      gap: ms(8),
      marginTop: ms(8),
    },
    reminderPickerBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(44),
      borderWidth: 1,
      borderColor: colors.border,
      gap: ms(6),
    },
    reminderPickerText: {
      flex: 1,
      fontSize: fs(13),
      fontFamily: FONT.regular,
      color: colors.text,
    },
    reminderPickerPlaceholder: {
      color: colors.textLight,
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
      let reminderAt = null;
      if (remindMe && reminderDate && reminderTime) {
        const dt = new Date(reminderDate);
        dt.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
        reminderAt = dt.toISOString();
      }

      const data = {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        deadline: deadline ? deadline.toISOString() : null,
        reminderAt,
        soundName: remindMe ? soundName : "default",
      };

      if (isEdit) {
        await updateTask(existingTask.id, data);
      } else {
        await addTask(data);
      }
      Keyboard.dismiss();
      onSaved?.();
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

  const handleReminderDateChange = (event, selectedDate) => {
    setShowReminderDatePicker(false);
    if (selectedDate) setReminderDate(selectedDate);
  };

  const handleReminderTimeChange = (event, selectedDate) => {
    setShowReminderTimePicker(false);
    if (selectedDate) setReminderTime(selectedDate);
  };

  function formatTime(date) {
    if (!date) return "";
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
              numberOfLines={3}
              textAlignVertical="top"
            />
          </BouncyInput>
        </View>

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

        {isEdit ? (
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
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={fs(18)} color={colors.textSecondary} />
            <Text style={[styles.dateText, !deadline && styles.datePlaceholder]}>
              {deadline ? formatDate(deadline) : "Set a deadline (optional)"}
            </Text>
            {deadline ? (
              <TouchableOpacity onPress={() => setDeadline(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={fs(18)} color={colors.textLight} />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
          {showDatePicker && DateTimePicker ? (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              accentColor={colors.primary}
            />
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Reminder</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Remind me</Text>
            <Switch
              value={remindMe}
              onValueChange={setRemindMe}
              trackColor={{ false: colors.border, true: colors.text }}
              thumbColor={COLORS.white}
            />
          </View>
          {remindMe ? (
            <>
              <View style={styles.reminderPickers}>
                <TouchableOpacity style={styles.reminderPickerBtn} onPress={() => setShowReminderDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={fs(16)} color={colors.textSecondary} />
                  <Text style={[styles.reminderPickerText, !reminderDate && styles.reminderPickerPlaceholder]}>
                    {reminderDate ? formatDate(reminderDate) : "Date"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reminderPickerBtn} onPress={() => setShowReminderTimePicker(true)}>
                  <Ionicons name="time-outline" size={fs(16)} color={colors.textSecondary} />
                  <Text style={[styles.reminderPickerText, !reminderTime && styles.reminderPickerPlaceholder]}>
                    {reminderTime ? formatTime(reminderTime) : "Time"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: ms(8) }}>
                <DropdownPicker
                  options={SOUND_OPTIONS}
                  value={soundName}
                  onSelect={setSoundName}
                  label="Alarm Sound"
                />
              </View>
            </>
          ) : null}
          {showReminderDatePicker && DateTimePicker ? (
            <DateTimePicker
              value={reminderDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleReminderDateChange}
              accentColor={colors.primary}
            />
          ) : null}
          {showReminderTimePicker && DateTimePicker ? (
            <DateTimePicker
              value={reminderTime || new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleReminderTimeChange}
              accentColor={colors.primary}
            />
          ) : null}
        </View>

        <View style={{ marginTop: ms(8), marginBottom: ms(4) }}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark" size={ms(20)} color={COLORS.white} />
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : isEdit ? "Update Task" : "Add Task"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
