import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme";

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
};

export function CaseSearchBar({ value = "", onChangeText, onClear }: Props) {
  return (
    <View style={styles.container}>
      <Feather name="search" size={18} color={colors.textMuted} style={styles.icon} />
      <TextInput
        placeholder="Search cases by ID, name, location, or type..."
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText?.("");
            onClear?.();
          }}
          hitSlop={8}
          style={styles.clearBtn}
        >
          <Feather name="x-circle" size={16} color={colors.textPlaceholder} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginTop: 16,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
});