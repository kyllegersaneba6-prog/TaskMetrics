import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT, withAlpha, moderateScale, fontScale } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";

export default function EmptyState({ icon = "list-outline", title, message, action }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(colors.textLight, 0.08) }]}>
        <Ionicons name={icon} size={moderateScale(32)} color={colors.textLight} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {title || "Nothing here yet"}
      </Text>
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(64),
  },
  iconWrap: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  title: {
    fontSize: fontScale(18),
    fontFamily: FONT.semiBold,
    marginTop: moderateScale(4),
    textAlign: "center",
  },
  message: {
    fontSize: fontScale(14),
    fontFamily: FONT.regular,
    marginTop: moderateScale(6),
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
});
