import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function LoadingSpinner({ size = "large" }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
