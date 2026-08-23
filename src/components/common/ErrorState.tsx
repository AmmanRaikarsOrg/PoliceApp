import React from "react";
import { Text, View } from "react-native";

type Props = {
  message?: string;
};

export function ErrorState({
  message = "Something went wrong.",
}: Props) {
  return (
    <View>
      <Text>{message}</Text>
    </View>
  );
}