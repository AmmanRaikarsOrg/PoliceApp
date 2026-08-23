import React from "react";
import { Text, View } from "react-native";

type Props = {
  message: string;
};

export function EmptyState({
  message,
}: Props) {
  return (
    <View>
      <Text>{message}</Text>
    </View>
  );
}