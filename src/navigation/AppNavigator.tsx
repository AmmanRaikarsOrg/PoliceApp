import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";

import { AuthScreen } from "../screens/AuthScreen";
import { CasePageScreen } from "../screens/CasePageScreen";
import { ComplaintRegistrationScreen } from "../screens/ComplaintRegistrationScreen";
import { DocumentGenerationScreen } from "../screens/DocumentGenerationScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MarkdownDocxTestScreen } from "../screens/MarkdownDocxTestScreen";
import { MarkdownPreviewScreen } from "../screens/MarkdownPreviewScreen";
import { NudiFontTestScreen } from '../screens/NudiFontTestScreen'

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#0F172A",
        headerTitleStyle: {
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: "#F8FAFC",
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
          headerShown: false,
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
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MarkdownDocxTest"
        component={MarkdownDocxTestScreen}
        options={{
          title: "DOCX Test",
        }}
      />

      <Stack.Screen
        name="MarkdownPreview"
        component={MarkdownPreviewScreen}
        options={{
          title: "Preview",
        }}
      />

      <Stack.Screen
        name="NudiFontTest"
        component={NudiFontTestScreen}
        options={{
          title: "Font Test",
        }}
      />
      
    </Stack.Navigator>
  );
}