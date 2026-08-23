import React from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";
import { LoginForm } from "../components/auth/LoginForm";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ navigation }: Props) {
  const handleLoginSuccess = () => {
    navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },
});