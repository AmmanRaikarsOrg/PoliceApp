import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Input } from "../common/Input";
import { Button } from "../common/Button";

type Props = {
  onLoginSuccess: () => void;
};

export function LoginForm({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Backend authentication will be implemented here.
    onLoginSuccess();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Case Files</Text>

      <Text style={styles.subtitle}>
        Login to continue
      </Text>

      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <Button
        title="Login"
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },

  title: {
    color: "#F4F5F7",
    fontSize: 36,
    fontWeight: "800",
  },

  subtitle: {
    color: "#9AA3AF",
    fontSize: 16,
  },
});