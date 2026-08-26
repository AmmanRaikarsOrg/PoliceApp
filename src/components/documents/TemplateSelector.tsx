import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DocumentTemplate } from "../../services/documents/documentService";

type Props = {
  templates?: DocumentTemplate[];
  selectedTemplate?: DocumentTemplate | null;
  onSelectTemplate?: (template: DocumentTemplate | null) => void;
  loading?: boolean;
};

export function TemplateSelector({
  templates = [],
  selectedTemplate,
  onSelectTemplate,
  loading = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (template: DocumentTemplate) => {
    if (selectedTemplate?.id === template.id) {
      onSelectTemplate?.(null);
    } else {
      onSelectTemplate?.(template);
    }
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* Dropdown Header Trigger */}
      <Pressable
        style={styles.dropdownHeader}
        onPress={() => setIsOpen(!isOpen)}
        accessibilityRole="button"
        accessibilityLabel="Select Document Type"
      >
        <Text
          style={[
            styles.dropdownText,
            selectedTemplate && styles.selectedDropdownText,
          ]}
          numberOfLines={1}
        >
          {selectedTemplate ? selectedTemplate.name : "Select Document Type"}
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#0F294A"
        />
      </Pressable>

      {/* Expanded Options List */}
      {isOpen && (
        <View style={styles.optionsContainer}>
          <View style={styles.dividerLine} />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0F294A" />
            </View>
          ) : templates.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No document types available</Text>
            </View>
          ) : (
            templates.map((tpl, index) => {
              const isSelected = selectedTemplate?.id === tpl.id;

              return (
                <Pressable
                  key={tpl.id || index.toString()}
                  style={({ pressed }) => [
                    styles.optionRow,
                    index === templates.length - 1 && styles.lastOptionRow,
                    isSelected && styles.selectedOptionRow,
                    pressed && styles.pressedOptionRow,
                  ]}
                  onPress={() => handleSelect(tpl)}
                >
                  <Text
                    style={[
                      styles.optionTitle,
                      isSelected && styles.selectedOptionTitle,
                    ]}
                  >
                    {tpl.name}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color="#0F294A" />
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  selectedDropdownText: {
    color: "#0F294A",
    fontWeight: "700",
  },
  optionsContainer: {
    backgroundColor: "#FFFFFF",
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  selectedOptionRow: {
    backgroundColor: "#F0F4F9",
  },
  pressedOptionRow: {
    backgroundColor: "#F8FAFC",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  selectedOptionTitle: {
    color: "#0F294A",
    fontWeight: "700",
  },
  loadingBox: {
    padding: 16,
    alignItems: "center",
  },
  emptyBox: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});