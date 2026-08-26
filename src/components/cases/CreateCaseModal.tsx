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
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const insets = useSafeAreaInsets();

  const handleCreate = () => {
    if (!caseName.trim()) {
      return;
    }

    // Backend case creation will go here.
    const caseId = "temporary-case-id";

    onCaseCreated(caseId);
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
            label="Case Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />

          <Input
            label="Case Type"
            value={type}
            onChangeText={setType}
            placeholder="Case type"
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
    backgroundColor: "rgba(50, 44, 44, 0.7)",
  },

  modal: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#e9e9e9ff",
    gap: 14,
  },

  title: {
    color: "#000000ff",
    fontSize: 24,
    fontWeight: "800",
  },
  caseTypeLabel: {
    color: "#635959ff",
    fontSize: 14,
    fontWeight: "400",
  },
  caseTypeInput: {
    borderBottomColor: "#000000ff",
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
  }
});