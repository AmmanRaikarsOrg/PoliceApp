import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";
import { LoginScreen } from "./LoginScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ navigation }: Props) {
  const handleLoginSuccess = () => {
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoginScreen
        navigation={navigation}
        onLoginSuccess={handleLoginSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
});
