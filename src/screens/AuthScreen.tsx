import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";
import { LoginScreen } from "./LoginScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ navigation }: Props) {
  const handleLoginSuccess = () => {
    navigation.replace("Home");
  };

  return (
    <LoginScreen
      navigation={navigation}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}