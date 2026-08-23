import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";

const TEST_TEXT =
  "C¥ÀgÁzsÀ ¸ÀÜ¼ÀzÀ ¥ÀAZÀ£ÁªÉÄ";

export function NudiFontTestScreen() {
  const [fontsLoaded] = useFonts({
    "Nudi 05 e": require(
      "../assets/fonts/NudiE05.ttf"
    ),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>
          Loading Nudi font...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        System font:
      </Text>

      <Text style={styles.normal}>
        {TEST_TEXT}
      </Text>

      <Text style={styles.label}>
        Nudi 05 e:
      </Text>

      <Text style={styles.nudi}>
        {TEST_TEXT}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
    padding: 24,
    justifyContent: "center",
  },

  label: {
    color: "#9AA3AF",
    fontSize: 14,
    marginTop: 24,
    marginBottom: 8,
  },

  normal: {
    color: "#F4F5F7",
    fontSize: 20,
  },

  nudi: {
    color: "#F4F5F7",
    fontFamily: "Nudi 05 e",
    fontSize: 20,
  },

  loading: {
    color: "#F4F5F7",
    fontSize: 18,
  },
});