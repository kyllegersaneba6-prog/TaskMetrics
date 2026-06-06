import { Stack } from "expo-router";
import { useTheme } from "../../../src/context/ThemeContext";

export default function TaskStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "transparent" },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 18 },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Task Details",
        }}
      />
    </Stack>
  );
}
