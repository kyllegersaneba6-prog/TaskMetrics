import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT, withAlpha, moderateScale, fontScale, useIsTablet } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";

export default function ConfirmDialog({ visible, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm, onCancel, confirmColor: confirmColorProp }) {
  const { colors } = useTheme();
  const isTablet = useIsTablet();
  const confirmColor = confirmColorProp || colors.danger;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, maxWidth: isTablet ? moderateScale(400) : moderateScale(320) }]}>
          <View style={[styles.iconWrap, { backgroundColor: withAlpha(confirmColor, 0.1) }]}>
            <Ionicons name="alert-circle" size={moderateScale(28)} color={confirmColor} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {title || "Confirm"}
          </Text>
          {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: confirmColor }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(32),
  },
  dialog: {
    borderRadius: moderateScale(20),
    padding: moderateScale(28),
    width: "90%",
    alignItems: "center",
  },
  iconWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  title: {
    fontSize: fontScale(18),
    fontFamily: FONT.bold,
    textAlign: "center",
  },
  message: {
    fontSize: fontScale(14),
    fontFamily: FONT.regular,
    textAlign: "center",
    marginTop: moderateScale(8),
    lineHeight: moderateScale(20),
  },
  actions: {
    flexDirection: "row",
    marginTop: moderateScale(24),
    gap: moderateScale(12),
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: {
    fontSize: fontScale(15),
    fontFamily: FONT.semiBold,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  confirmText: {
    fontSize: fontScale(15),
    fontFamily: FONT.semiBold,
    color: "#FFFFFF",
  },
});
