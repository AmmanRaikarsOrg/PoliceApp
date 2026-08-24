import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function Button({
  title,
  onPress,
  variant = "primary",
}: Props) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" &&
            styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#0F294A",
    alignItems: "center",
  },

  secondary: {
    backgroundColor: "#E2E8F0",
  },

  text: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  secondaryText: {
    color: "#0F294A",
  },
});