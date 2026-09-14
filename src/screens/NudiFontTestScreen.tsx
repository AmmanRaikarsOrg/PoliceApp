import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";

const TEST_HEADING = "C¥ÀgÁzsÀ ¸ÀÜ¼ÀzÀ ¥ÀAZÀ£ÁªÉÄ";
const TEST_PARAGRAPH =
  "F PÉ¼ÀUÉ ¸À» ªÀiÁrzÀ ¥ÀAZÀ d£ÀgÁzÀ, ²æÃ ¸ÀÄPÉÃ±À «oÀ×® zÉÃªÁrUÀ, ªÀAiÀÄ¸ÀÄì-23 ªÀµÀð, eÁw-»AzÀÆ zÉªÁrUÀ, GzÉÆåÃUÀ- ºÉÆmÉÃ¯ïzÀ°è PÉ®¸À";
const TEST_NUMBERS = "1] ¢£ÁAPÀ: 10/08/2025, ¸ÀASÉå: 46/2025, ªÉÆÃ: 9353583134";

export function NudiFontTestScreen() {
  const [fontsLoaded, fontError] = useFonts({
    "Nudi 05 e": require("../assets/fonts/NudiE05.ttf"),
    "NudiE05": require("../assets/fonts/NudiE05.ttf"),
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loading}>Loading Nudi fonts...</Text>
      </View>
    );
  }

  if (fontError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Font Loading Failed</Text>
        <Text style={styles.errorText}>{fontError.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Nudi Font Diagnostic Test</Text>
      <Text style={styles.statusBadge}>Status: Font Loaded Successfully (Nudi 05 e / NudiE05)</Text>

      {/* Heading Comparison */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>1. Title / Heading Comparison</Text>
        
        <Text style={styles.subLabel}>System Font (Raw ASCII):</Text>
        <Text style={styles.systemText}>{TEST_HEADING}</Text>

        <View style={styles.divider} />

        <Text style={styles.subLabel}>Nudi 05 e Font (Kannada):</Text>
        <Text style={styles.nudiHeading}>{TEST_HEADING}</Text>
      </View>

      {/* Paragraph Comparison */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>2. Paragraph / Body Comparison</Text>

        <Text style={styles.subLabel}>System Font (Raw ASCII):</Text>
        <Text style={styles.systemText}>{TEST_PARAGRAPH}</Text>

        <View style={styles.divider} />

        <Text style={styles.subLabel}>Nudi 05 e Font (Kannada):</Text>
        <Text style={styles.nudiBody}>{TEST_PARAGRAPH}</Text>
      </View>

      {/* Numbers & Symbols Comparison */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>3. Numbers & Symbols</Text>

        <Text style={styles.subLabel}>System Font (Raw ASCII):</Text>
        <Text style={styles.systemText}>{TEST_NUMBERS}</Text>

        <View style={styles.divider} />

        <Text style={styles.subLabel}>Nudi 05 e Font (Kannada):</Text>
        <Text style={styles.nudiBody}>{TEST_NUMBERS}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0B0D10",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  statusBadge: {
    color: "#34D399",
    fontSize: 13,
    backgroundColor: "#064E3B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  card: {
    backgroundColor: "#161B22",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#30363D",
    gap: 10,
  },
  cardHeader: {
    color: "#60A5FA",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  subLabel: {
    color: "#8B949E",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#21262D",
    marginVertical: 4,
  },
  systemText: {
    color: "#9AA3AF",
    fontSize: 15,
    lineHeight: 22,
  },
  nudiHeading: {
    color: "#F0F6FC",
    fontFamily: "Nudi 05 e",
    fontSize: 24,
    lineHeight: 34,
  },
  nudiBody: {
    color: "#F0F6FC",
    fontFamily: "Nudi 05 e",
    fontSize: 18,
    lineHeight: 30,
  },
  loading: {
    color: "#F0F6FC",
    fontSize: 16,
  },
  errorTitle: {
    color: "#F87171",
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    color: "#9AA3AF",
    fontSize: 14,
    textAlign: "center",
  },
});