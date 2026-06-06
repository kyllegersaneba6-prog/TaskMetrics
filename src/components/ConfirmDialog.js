import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT, withAlpha, moderateScale, fontScale, useIsTablet } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";

export default function ConfirmDialog({ visible, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm, onCancel, confirmColor: confirmColorProp }) {
  const { colors } = useTheme();
  const isTablet = useIsTablet();
  const confirmColor = confirmColorProp || colors.danger;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => setScreenWidth(window.width));
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      slideAnim.setValue(-screenWidth);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleCancel = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setRendered(false);
      onCancel?.();
    });
  }, [screenWidth, onCancel]);

  const handleConfirm = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setRendered(false);
      onConfirm?.();
    });
  }, [screenWidth, onConfirm]);

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.dialog, { backgroundColor: colors.surface, maxWidth: isTablet ? moderateScale(400) : moderateScale(320), transform: [{ translateX: slideAnim }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: withAlpha(confirmColor, 0.1) }]}>
            <Ionicons name="alert-circle" size={moderateScale(28)} color={confirmColor} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {title || "Confirm"}
          </Text>
          {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={handleCancel}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: confirmColor }]} onPress={handleConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
