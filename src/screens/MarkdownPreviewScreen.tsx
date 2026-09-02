import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFonts } from "expo-font";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { MarkdownViewer } from "../components/documents/MarkdownViewer";
import { TEST_PANCHANAMA } from "../utils/testMarkdown";
import { getDocument } from "../services/documents/documentService";
import { shareDocx } from "../services/documents/docxFileService";

type Props = NativeStackScreenProps<RootStackParamList, "MarkdownPreview">;

export function MarkdownPreviewScreen({ navigation, route }: Props) {
  const params = route?.params;
  const [fontsLoaded, fontError] = useFonts({
    "Nudi 05 e": require("../assets/fonts/NudiE05.ttf"),
    "NudiE05": require("../assets/fonts/NudiE05.ttf"),
  });

  const [contentMarkdown, setContentMarkdown] = useState<string>(
    params?.markdown || TEST_PANCHANAMA
  );
  const [docTitle, setDocTitle] = useState<string>(
    params?.title || "Document Preview"
  );
  const [docSubtitle, setDocSubtitle] = useState<string>(
    params?.subtitle || "Panchanama (Kannada Case Document)"
  );
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (params?.caseId && params?.documentId && !params.markdown) {
      getDocument(params.caseId, "complaint", params.documentId).then((doc) => {
        if (doc) {
          setContentMarkdown(doc.markdown || TEST_PANCHANAMA);
          setDocTitle(doc.title || "Document Preview");
          setDocSubtitle(doc.templateName || "Document");
        }
      });
    } else if (params?.markdown) {
      setContentMarkdown(params.markdown);
      if (params.title) setDocTitle(params.title);
      if (params.subtitle) setDocSubtitle(params.subtitle);
    }
  }, [params]);

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      await shareDocx(
        contentMarkdown,
        `${docTitle.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
      );
    } catch (err) {
      Alert.alert(
        "Export Failed",
        err instanceof Error ? err.message : "Could not export DOCX."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {docTitle}
            </Text>
            <Text style={styles.subtitle}>{docSubtitle}</Text>
          </View>

          <Pressable
            style={styles.exportBtn}
            onPress={handleExportDocx}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="download" size={15} color="#FFFFFF" />
                <Text style={styles.exportBtnText}>Export DOCX</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <MarkdownViewer
        markdown={TEST_PANCHANAMA}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0B0D10",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#F4F5F7",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
    backgroundColor: "#161B22",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#1E3A5F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  badgeText: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitle: {
    color: "#8B949E",
    marginTop: 4,
    fontSize: 13,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E40AF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});