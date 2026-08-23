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
    backgroundColor: "#F4F5F7",
    alignItems: "center",
  },

  secondary: {
    backgroundColor: "#2B313A",
  },

  text: {
    color: "#0B0D10",
    fontWeight: "700",
  },

  secondaryText: {
    color: "#F4F5F7",
  },
});