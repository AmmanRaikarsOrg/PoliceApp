import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MarkdownViewer } from "../components/documents/MarkdownViewer";
import { TEST_PANCHANAMA } from "../utils/testMarkdown";
export function MarkdownPreviewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Document Preview
        </Text>

        <Text style={styles.subtitle}>
          Panchanama
        </Text>
      </View>

      <MarkdownViewer
        markdown={TEST_PANCHANAMA}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2B313A",
  },

  title: {
    color: "#F4F5F7",
    fontSize: 22,
    fontWeight: "800",
  },

  subtitle: {
    color: "#9AA3AF",
    marginTop: 4,
  },
});