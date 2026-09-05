import React, { useState } from "react";
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useCases } from "../../hooks/useCases";
import { colors } from "../../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCaseCreated: (caseId: string) => void;
};

export function CreateCaseModal({
  visible,
  onClose,
  onCaseCreated,
}: Props) {
  const [caseName, setCaseName] = useState("");
  const [description, setDescription] = useState("");
  const [caseType, setCaseType] = useState("");
  const [location, setLocation] = useState("");
  const [firNumber, setFirNumber] = useState("");
  const [date, setDate] = useState("");
  const insets = useSafeAreaInsets();
  
  const { createNewCase } = useCases();

  const handleCreate = async () => {
    if (!caseName.trim()) {
      return;
    }

    try {
      const newCase = await createNewCase({
        title: caseName,
        description: description,
        caseType: caseType.trim() || undefined,
        location,
        firNumber,
        date
      });
      onCaseCreated(newCase.id);
    } catch (error) {
      console.error("Failed to create case:", error);
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(20, insets.top),
            paddingBottom: Math.max(20, insets.bottom),
          },
        ]}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>
            Make New Case
          </Text>

          <Input
            label="Case Name *"
            value={caseName}
            onChangeText={setCaseName}
            placeholder="Case name"
          />

          <Input
            label="Case Type (e.g. Theft, Cybercrime, Fraud)"
            value={caseType}
            onChangeText={setCaseType}
            placeholder="Case Category"
          />

          <Input
            label="Case Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />

          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Location"
          />

          <Input
            label="FIR Number"
            value={firNumber}
            onChangeText={setFirNumber}
            placeholder="FIR Number"
          />

          <Input
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="Date"
          />

          <Button
            title="Create Case"
            onPress={handleCreate}
          />

          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
          />
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.overlay,
  },

  modal: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    gap: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  title: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  caseTypeLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "400",
  },
  caseTypeInput: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  }
});