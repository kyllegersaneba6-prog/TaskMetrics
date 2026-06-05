import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONT, moderateScale, fontScale } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";

export default function SearchBar({ value, onChangeText, placeholder = "Search tasks..." }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={moderateScale(18)} color={colors.textLight} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={moderateScale(18)} color={colors.textLight} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    marginHorizontal: moderateScale(20),
    marginVertical: moderateScale(8),
    minHeight: moderateScale(44),
    borderWidth: 1,
  },
  icon: {
    marginRight: moderateScale(8),
  },
  input: {
    flex: 1,
    fontSize: fontScale(15),
    fontFamily: FONT.regular,
  },
});
