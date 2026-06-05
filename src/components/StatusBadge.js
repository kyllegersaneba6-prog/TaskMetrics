import { View, Text, StyleSheet } from "react-native";
import { STATUSES, FONT, withAlpha, moderateScale, fontScale } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";

export default function StatusBadge({ status }) {
  const { colors } = useTheme();
  const STATUS_COLORS = {
    pending: colors.warning,
    in_progress: colors.primary,
    completed: colors.success,
  };
  const color = STATUS_COLORS[status] || colors.textSecondary;
  const label = STATUSES[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.1), borderColor: withAlpha(color, 0.2) }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    marginRight: moderateScale(6),
  },
  text: {
    fontSize: fontScale(12),
    fontFamily: FONT.semiBold,
  },
});
