import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";

import { AuthScreen } from "../screens/AuthScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ComplaintRegistrationScreen } from "../screens/ComplaintRegistrationScreen";
import { CasePageScreen } from "../screens/CasePageScreen";
import { DocumentGenerationScreen } from "../screens/DocumentGenerationScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0B0D10",
        },
        headerTintColor: "#F4F5F7",
        headerTitleStyle: {
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: "#0B0D10",
        },
      }}
    >
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Case Files",
        }}
      />

      <Stack.Screen
        name="ComplaintRegistration"
        component={ComplaintRegistrationScreen}
        options={{
          title: "Complaint Registration",
        }}
      />

      <Stack.Screen
        name="CasePage"
        component={CasePageScreen}
        options={{
          title: "Case",
        }}
      />

      <Stack.Screen
        name="DocumentGeneration"
        component={DocumentGenerationScreen}
        options={{
          title: "Generate Document",
        }}
      />
    </Stack.Navigator>
  );
}