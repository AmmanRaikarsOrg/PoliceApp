import React from "react";
import { FlatList } from "react-native";

import { CaseCard } from "./CaseCard";

type Props = {
  onCasePress?: (caseId: string) => void;
};

export function CaseGrid({ onCasePress }: Props) {
  const cases: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }> = [];

  return (
    <FlatList
      data={cases}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{
        gap: 12,
      }}
      contentContainerStyle={{
        gap: 12,
      }}
      renderItem={({ item }) => (
        <CaseCard
          name={item.name}
          type={item.type}
          status={item.status}
          onPress={() => onCasePress?.(item.id)}
        />
      )}
    />
  );
}