import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
};

export function CaseSearchBar({ value = "", onChangeText, onClear }: Props) {
  return (
    <View style={styles.container}>
      <Feather name="search" size={18} color="#64748B" style={styles.icon} />
      <TextInput
        placeholder="Search cases by ID, name, location, or type..."
        placeholderTextColor="#94A3B8"
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
          <Feather name="x-circle" size={16} color="#94A3B8" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    color: "#0F172A",
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
});