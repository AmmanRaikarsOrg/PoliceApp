import React from "react";
import { FlatList } from "react-native";

import { CaseCard } from "./CaseCard";

type Props = {
  onCasePress?: (caseId: string) => void;
};

export function CaseGrid({ onCasePress }: Props) {
  const cases = [
    {
      id: "#2024-0812",
      name: "Downtown Traffic Incident",
      date: "Oct 24, 2024",
      updated: "Updated 2h ago",
      status: "Open",
    },
    {
      id: "#2024-0811",
      name: "Commercial Burglary - 4th Ave",
      date: "Oct 23, 2024",
      updated: "Updated 1d ago",
      status: "In Progress",
    },
    {
      id: "#2024-0809",
      name: "Vandalism Report - City Park",
      date: "Oct 20, 2024",
      updated: "Updated Oct 22",
      status: "Closed",
    },
  ];

  return (
    <FlatList
      data={cases}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        gap: 12,
        paddingBottom: 24,
      }}
      renderItem={({ item }) => (
        <CaseCard
          id={item.id}
          name={item.name}
          date={item.date}
          updated={item.updated}
          status={item.status}
          onPress={() => onCasePress?.(item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}