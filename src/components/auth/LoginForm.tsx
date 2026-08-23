import React from "react";
import { LoginScreen } from "../../screens/LoginScreen";

type Props = {
  onLoginSuccess: () => void;
};

export function LoginForm({ onLoginSuccess }: Props) {
  return <LoginScreen onLoginSuccess={onLoginSuccess} />;
}