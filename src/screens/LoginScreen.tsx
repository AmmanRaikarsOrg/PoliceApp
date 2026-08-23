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

export type LoginScreenProps = {
  onLoginSuccess?: () => void;
  onForgotPassword?: () => void;
  navigation?: any;
};

// --- Custom Icon Components ---

function ShieldBadge() {
  return (
    <View style={iconStyles.badgeContainer}>
      <View style={iconStyles.shieldOuter}>
        <Text style={iconStyles.shieldStar}>★</Text>
      </View>
    </View>
  );
}

function UserIcon() {
  return (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.userHead} />
      <View style={iconStyles.userBody} />
    </View>
  );
}

function LockIcon() {
  return (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.lockShackle} />
      <View style={iconStyles.lockBody} />
    </View>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <View style={iconStyles.eyeWrapper}>
      <View style={[iconStyles.eyeOval, visible && iconStyles.eyeOvalVisible]}>
        <View style={[iconStyles.eyePupil, visible && iconStyles.eyePupilVisible]} />
      </View>
      {!visible && <View style={iconStyles.eyeSlash} />}
    </View>
  );
}

function LoginIcon() {
  return (
    <View style={iconStyles.loginIconContainer}>
      <View style={iconStyles.loginDoor} />
      <View style={iconStyles.loginArrowLine} />
      <View style={iconStyles.loginArrowHead} />
    </View>
  );
}

// --- Main LoginScreen Component ---

export function LoginScreen({
  onLoginSuccess,
  onForgotPassword,
  navigation,
}: LoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    // Backend authentication not implemented yet per specification
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
                <UserIcon />
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
                <LockIcon />
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
                  <EyeIcon visible={isPasswordVisible} />
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
              <LoginIcon />
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

const iconStyles = StyleSheet.create({
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
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.6,
    borderColor: "#64748B",
  },
  userBody: {
    width: 13,
    height: 6,
    borderTopLeftRadius: 6.5,
    borderTopRightRadius: 6.5,
    borderWidth: 1.6,
    borderColor: "#64748B",
    borderBottomWidth: 0,
    marginTop: 1,
  },
  lockShackle: {
    width: 9,
    height: 6,
    borderTopLeftRadius: 4.5,
    borderTopRightRadius: 4.5,
    borderWidth: 1.6,
    borderColor: "#64748B",
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  lockBody: {
    width: 13,
    height: 9,
    borderRadius: 2,
    borderWidth: 1.6,
    borderColor: "#64748B",
  },
  loginIconContainer: {
    width: 18,
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  loginDoor: {
    height: 12,
    width: 5,
    borderRightWidth: 1.8,
    borderTopWidth: 1.8,
    borderBottomWidth: 1.8,
    borderColor: "#FFFFFF",
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  loginArrowLine: {
    width: 7,
    height: 1.8,
    backgroundColor: "#FFFFFF",
    marginLeft: 2,
  },
  loginArrowHead: {
    width: 4,
    height: 4,
    borderTopWidth: 1.8,
    borderRightWidth: 1.8,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
    marginLeft: -3,
  },
  eyeWrapper: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  eyeOval: {
    width: 13,
    height: 13,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderWidth: 1.4,
    borderColor: "#94A3B8",
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  eyeOvalVisible: {
    borderColor: "#0F294A",
  },
  eyePupil: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#94A3B8",
  },
  eyePupilVisible: {
    backgroundColor: "#0F294A",
  },
  eyeSlash: {
    width: 20,
    height: 1.4,
    backgroundColor: "#94A3B8",
    borderRadius: 1,
    position: "absolute",
    transform: [{ rotate: "-45deg" }],
  },
});
