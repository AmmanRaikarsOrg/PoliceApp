import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  rightIcon,
  style,
  textStyle,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" ? "#0F294A" : "#FFFFFF"}
        />
      ) : (
        <View style={styles.contentRow}>
          <Text
            style={[
              styles.text,
              variant === "secondary" && styles.secondaryText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.iconMargin}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  secondary: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.88,
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryText: {
    color: "#0F294A",
  },

  iconMargin: {
    marginLeft: 6,
  },
});