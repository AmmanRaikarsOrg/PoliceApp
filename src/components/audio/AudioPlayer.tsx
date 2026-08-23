import React from "react";
import { Pressable, Text } from "react-native";

type Props = {
  uri: string;
};

export function AudioPlayer({ uri }: Props) {
  const handlePlay = () => {
    console.log("Play:", uri);
  };

  return (
    <Pressable onPress={handlePlay}>
      <Text>▶ Play</Text>
    </Pressable>
  );
}