import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fonts } from "../../theme/fonts";

type Props = {
  markdown: string;
};

export function MarkdownViewer({
  markdown,
}: Props) {
  const blocks = markdown
    .replace(/\r\n/g, "\n")
    .split("\n");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {blocks.map((line, index) => (
        <MarkdownLine
          key={`${index}-${line}`}
          line={line}
        />
      ))}
    </ScrollView>
  );
}

type LineProps = {
  line: string;
};

function MarkdownLine({ line }: LineProps) {
  const trimmed = line.trim();

  if (!trimmed) {
    return <View style={styles.spacer} />;
  }

  // Markdown heading
  const headingMatch =
    trimmed.match(/^(#{1,6})\s+(.+)$/);

  if (headingMatch) {
    const level = headingMatch[1].length;

    return (
      <Text
        style={[
          styles.text,
          level === 1 && styles.heading1,
          level === 2 && styles.heading2,
          level >= 3 && styles.heading3,
        ]}
      >
        {headingMatch[2]}
      </Text>
    );
  }

  // Markdown horizontal rule
  if (/^([-*_])(?:\s*\1){2,}$/.test(trimmed)) {
    return <View style={styles.rule} />;
  }

  // Numbered list
  const numbered =
    trimmed.match(/^(\d+)[.)]\s+(.+)$/);

  if (numbered) {
    return (
      <View style={styles.listRow}>
        <Text style={styles.listNumber}>
          {numbered[1]}.
        </Text>

        <Text style={styles.text}>
          {numbered[2]}
        </Text>
      </View>
    );
  }

  // Bullet list
  const bullet =
    trimmed.match(/^[-*+]\s+(.+)$/);

  if (bullet) {
    return (
      <View style={styles.listRow}>
        <Text style={styles.bullet}>
          •
        </Text>

        <Text style={styles.text}>
          {bullet[1]}
        </Text>
      </View>
    );
  }

  // Blockquote
  if (trimmed.startsWith(">")) {
    return (
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>
          {trimmed.replace(/^>\s?/, "")}
        </Text>
      </View>
    );
  }

  return (
    <Text style={styles.text}>
      {trimmed}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  text: {
    fontFamily: fonts.nudiE05,
    fontSize: 17,
    lineHeight: 29,
    color: "#F4F5F7",
  },

  heading1: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "700",
    marginBottom: 12,
  },

  heading2: {
    fontSize: 23,
    lineHeight: 32,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },

  heading3: {
    fontSize: 20,
    lineHeight: 29,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },

  spacer: {
    height: 12,
  },

  rule: {
    height: 1,
    backgroundColor: "#2B313A",
    marginVertical: 12,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 8,
    marginBottom: 6,
  },

  listNumber: {
    width: 30,
    fontFamily: fonts.nudiE05,
    fontSize: 17,
    lineHeight: 29,
    color: "#F4F5F7",
  },

  bullet: {
    width: 25,
    fontFamily: fonts.nudiE05,
    fontSize: 20,
    lineHeight: 29,
    color: "#F4F5F7",
  },

  quoteContainer: {
    borderLeftWidth: 3,
    borderLeftColor: "#8AB4F8",
    paddingLeft: 14,
    marginVertical: 8,
  },

  quote: {
    fontFamily: fonts.nudiE05,
    fontSize: 17,
    lineHeight: 29,
    color: "#9AA3AF",
    fontStyle: "italic",
  },
});