import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  name: string;
  template: string;
};

export function DocumentCard({
  name,
  template,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.template}>{template}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
  },

  name: {
    color: "#F4F5F7",
    fontWeight: "700",
  },

  template: {
    color: "#9AA3AF",
    marginTop: 4,
  },
});