import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFonts } from "expo-font";

import { MarkdownViewer } from "../components/documents/MarkdownViewer";
import { TEST_PANCHANAMA } from "../utils/testMarkdown";

export function MarkdownPreviewScreen() {
  const [fontsLoaded, fontError] = useFonts({
    "Nudi 05 e": require("../assets/fonts/NudiE05.ttf"),
    "NudiE05": require("../assets/fonts/NudiE05.ttf"),
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Loading Nudi font preview...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            Document Preview
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Nudi 05 e</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Panchanama (Kannada Case Document)
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
  centerContainer: {
    flex: 1,
    backgroundColor: "#0B0D10",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#F4F5F7",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
    backgroundColor: "#161B22",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#1E3A5F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  badgeText: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitle: {
    color: "#8B949E",
    marginTop: 4,
    fontSize: 14,
  },
});