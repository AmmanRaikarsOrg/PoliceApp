import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";

export type LoginScreenProps = {
  onLoginSuccess?: () => void;
  onForgotPassword?: () => void;
  navigation?: any;
};

function ShieldBadge() {
  return (
    <View style={styles.badgeContainer}>
      <View style={styles.shieldOuter}>
        <Text style={styles.shieldStar}>★</Text>
      </View>
    </View>
  );
}

export function LoginScreen({
  onLoginSuccess,
  onForgotPassword,
  navigation,
}: LoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (navigation && typeof navigation.replace === "function") {
      navigation.replace("Home");
    } else {
      Alert.alert("Success", "Logged in successfully.");
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert(
        "Reset Password",
        "Instructions to reset your password have been sent to your registered department email."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Top Shield Logo */}
            <ShieldBadge />

            {/* Heading & Subtitle */}
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Secure access to the Justice Ledger system.
            </Text>

            {/* Email or Phone Number Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email or Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Feather
                  name="user"
                  size={18}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="officer@department.gov"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.labelNoMargin}>Password</Text>
                <Pressable
                  onPress={handleForgotPassword}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrapper}>
                <Feather
                  name="lock"
                  size={18}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  style={styles.eyeButton}
                >
                  <Feather
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={18}
                    color={isPasswordVisible ? "#0F294A" : "#94A3B8"}
                  />
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              accessibilityRole="button"
            >
              <Feather
                name="log-in"
                size={18}
                color="#FFFFFF"
                style={styles.loginIcon}
              />
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          </View>

          {/* Footer Information */}
          <View style={styles.footer}>
            <Text style={styles.footerTextPrimary}>
              Authorized Personnel Only.
            </Text>
            <Text style={styles.footerTextSecondary}>
              Activities are monitored and logged.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  badgeContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECEFF4",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  shieldOuter: {
    width: 28,
    height: 30,
    backgroundColor: "#06162E",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  shieldStar: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  labelNoMargin: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#06162E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  loginIcon: {
    marginRight: 4,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerTextPrimary: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
  },
  footerTextSecondary: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 2,
  },
});
