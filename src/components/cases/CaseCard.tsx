import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  name?: string;
  type?: string;
  status?: string;
  onPress?: () => void;
};

export function CaseCard({
  name = "Case Name",
  type = "Case Type",
  status = "OPEN",
  onPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.folder}>
        <Text style={styles.folderIcon}>📁</Text>
      </View>

      <Text style={styles.name}>{name}</Text>

      <Text style={styles.type}>{type}</Text>

      <Text style={styles.status}>{status}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 150,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
  },

  folder: {
    marginBottom: 12,
  },

  folderIcon: {
    fontSize: 36,
  },

  name: {
    color: "#F4F5F7",
    fontWeight: "700",
    fontSize: 16,
  },

  type: {
    color: "#9AA3AF",
    marginTop: 4,
  },

  status: {
    color: "#8AB4F8",
    marginTop: 8,
    fontWeight: "700",
  },
});