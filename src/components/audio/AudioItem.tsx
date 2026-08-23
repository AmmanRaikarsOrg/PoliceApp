import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  name: string;
  index: number;
};

export function AudioItem({
  name,
  index,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.index}>
        {index + 1}
      </Text>

      <Text style={styles.name}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  index: {
    color: "#9AA3AF",
    width: 30,
  },

  name: {
    color: "#F4F5F7",
  },
});