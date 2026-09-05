import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Case } from "../../utils/types";
import { CaseCard } from "./CaseCard";
import { colors } from "../../theme";

type Props = {
  cases?: Case[];
  loading?: boolean;
  onRefresh?: () => void;
  onCasePress?: (caseId: string) => void;
};

export function CaseGrid({
  cases = [],
  loading = false,
  onRefresh,
  onCasePress,
}: Props) {
  if (loading && cases.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading cases...</Text>
      </View>
    );
  }

  if (cases.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Cases Found</Text>
        <Text style={styles.emptySubtitle}>
          No police cases match your current filter or search query.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cases}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      renderItem={({ item }) => (
        <CaseCard
          id={item.caseNumber || item.id}
          name={item.name}
          date={item.date}
          updated={item.updatedAt || "Active"}
          status={item.status}
          caseType={item.caseType || item.type}
          onPress={() => onCasePress?.(item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
    gap: 6,
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
