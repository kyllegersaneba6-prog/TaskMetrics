import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { FONT, moderateScale, fontScale, useIsTablet } from "../utils/constants";
import { useTheme } from "../context/ThemeContext";

const ALL_OPTION = { key: "all", label: "All" };

function AnimatedChip({ chip, isActive, onSelect, isTablet, colors }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevActive = useRef(isActive);

  useEffect(() => {
    if (isActive !== prevActive.current) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 0.92,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.05,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();
      prevActive.current = isActive;
    }
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
          isTablet && styles.chipTablet,
        ]}
        onPress={() => onSelect(chip.key)}
      >
        <Text style={[styles.chipText, { color: isActive ? colors.white : colors.textSecondary }]}>
          {chip.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FilterChips({ options = [], selected, onSelect }) {
  const { colors } = useTheme();
  const isTablet = useIsTablet();
  const chips = [ALL_OPTION, ...options.map((o) => (typeof o === "string" ? { key: o, label: o } : o))];

  return (
    <View style={styles.container}>
      {chips.map((chip) => (
        <AnimatedChip
          key={chip.key}
          chip={chip}
          isActive={selected === chip.key}
          onSelect={onSelect}
          isTablet={isTablet}
          colors={colors}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(4),
    gap: moderateScale(8),
  },
  chip: {
    width: "48%",
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(100),
    borderWidth: 1,
    alignItems: "center",
  },
  chipTablet: {
    width: "23%",
  },
  chipText: {
    fontSize: fontScale(13),
    fontFamily: FONT.semiBold,
  },
});
