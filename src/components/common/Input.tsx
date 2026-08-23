import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  label?: string;
};

export function Input({
  label,
  ...props
}: Props) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        placeholderTextColor="#6F7782"
        style={[
          styles.input,
          props.multiline && styles.multiline,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },

  label: {
    color: "#F4F5F7",
    fontWeight: "600",
  },

  input: {
    color: "#F4F5F7",
    backgroundColor: "#0B0D10",
    borderWidth: 1,
    borderColor: "#2B313A",
    borderRadius: 12,
    padding: 14,
  },

  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});