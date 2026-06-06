import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { moderateScale, fontScale, FONT } from "../utils/constants";

export default function DropdownPicker({ options, value, onSelect, label }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  const ms = moderateScale;
  const fs = fontScale;

  return (
    <View>
      <TouchableOpacity
        style={[
          localStyles.trigger,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
        onPress={() => setOpen(true)}
      >
        <Ionicons name="musical-note-outline" size={fs(16)} color={colors.textSecondary} />
        <Text style={[localStyles.triggerText, { color: selected ? colors.text : colors.textLight }]}>
          {selected ? selected.label : (label || "Select")}
        </Text>
        <Ionicons name="chevron-down" size={fs(16)} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={localStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[localStyles.sheet, { backgroundColor: colors.surface }]}>
            {label ? <Text style={[localStyles.sheetTitle, { color: colors.textSecondary }]}>{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[localStyles.option, value === item.key && { backgroundColor: colors.background }]}
                  onPress={() => { onSelect(item.key); setOpen(false); }}
                >
                  <Text style={[localStyles.optionText, { color: colors.text }, value === item.key && { fontFamily: FONT.semiBold }]}>
                    {item.label}
                  </Text>
                  {value === item.key ? (
                    <Ionicons name="checkmark" size={fs(18)} color={colors.text} />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    minHeight: moderateScale(44),
    borderWidth: 1,
    gap: moderateScale(6),
  },
  triggerText: {
    flex: 1,
    fontSize: fontScale(13),
    fontFamily: FONT.regular,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(32),
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: fontScale(12),
    fontFamily: FONT.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(8),
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(20),
  },
  optionText: {
    fontSize: fontScale(15),
    fontFamily: FONT.regular,
  },
});
