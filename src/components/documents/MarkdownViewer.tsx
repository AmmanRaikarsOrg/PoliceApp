import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MarkdownViewerProps = {
  markdown: string;
};

type InlinePart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "bold";
      text: string;
    }
  | {
      type: "italic";
      text: string;
    }
  | {
      type: "strike";
      text: string;
    }
  | {
      type: "code";
      text: string;
    }
  | {
      type: "link";
      text: string;
      url: string;
    };

const FONT = "Nudi 05 e";

export function MarkdownViewer({
  markdown,
}: MarkdownViewerProps) {
  const lines = markdown
    .replace(/\r\n/g, "\n")
    .split("\n");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      {renderMarkdown(lines)}
    </ScrollView>
  );
}

function renderMarkdown(lines: string[]) {
  const elements: React.ReactNode[] = [];

  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      elements.push(
        <View
          key={`space-${index}`}
          style={styles.paragraphSpacing}
        />
      );

      index++;
      continue;
    }

    // Horizontal rule
    if (isHorizontalRule(line)) {
      elements.push(
        <View
          key={`rule-${index}`}
          style={styles.horizontalRule}
        />
      );

      index++;
      continue;
    }

    // Table
    if (
      index + 1 < lines.length &&
      line.includes("|") &&
      isTableSeparator(lines[index + 1])
    ) {
      const table = parseTable(lines, index);

      elements.push(
        <MarkdownTable
          key={`table-${index}`}
          headers={table.headers}
          rows={table.rows}
        />
      );

      index = table.nextIndex;
      continue;
    }

    // Heading
    const heading = line.match(
      /^(#{1,6})\s+(.+)$/
    );

    if (heading) {
      const level = heading[1].length;

      elements.push(
        <Text
          key={`heading-${index}`}
          style={[
            styles.heading,
            getHeadingStyle(level),
          ]}
        >
          {renderInline(heading[2])}
        </Text>
      );

      index++;
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];

      while (
        index < lines.length &&
        lines[index].trim().startsWith(">")
      ) {
        quoteLines.push(
          lines[index]
            .trim()
            .replace(/^>\s?/, "")
        );

        index++;
      }

      elements.push(
        <View
          key={`quote-${index}`}
          style={styles.quoteContainer}
        >
          <Text style={styles.quoteText}>
            {renderInline(
              quoteLines.join(" ")
            )}
          </Text>
        </View>
      );

      continue;
    }

    // Numbered list
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^\d+[.)]\s+/.test(
          lines[index].trim()
        )
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(/^\d+[.)]\s+/, "")
        );

        index++;
      }

      elements.push(
        <View
          key={`ordered-${index}`}
          style={styles.listContainer}
        >
          {items.map((item, itemIndex) => (
            <View
              key={`${itemIndex}-${item}`}
              style={styles.listRow}
            >
              <Text style={styles.number}>
                {itemIndex + 1}.
              </Text>

              <Text style={styles.bodyText}>
                {renderInline(item)}
              </Text>
            </View>
          ))}
        </View>
      );

      continue;
    }

    // Bullet list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^[-*+]\s+/.test(
          lines[index].trim()
        )
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(/^[-*+]\s+/, "")
        );

        index++;
      }

      elements.push(
        <View
          key={`bullet-${index}`}
          style={styles.listContainer}
        >
          {items.map((item, itemIndex) => (
            <View
              key={`${itemIndex}-${item}`}
              style={styles.listRow}
            >
              <Text style={styles.bullet}>
                •
              </Text>

              <Text style={styles.bodyText}>
                {renderInline(item)}
              </Text>
            </View>
          ))}
        </View>
      );

      continue;
    }

    // Normal paragraph
    const paragraphLines = [line];

    index++;

    while (index < lines.length) {
      const next = lines[index].trim();

      if (!next) break;

      if (
        /^(#{1,6})\s+/.test(next) ||
        /^[-*+]\s+/.test(next) ||
        /^\d+[.)]\s+/.test(next) ||
        next.startsWith(">") ||
        isHorizontalRule(next)
      ) {
        break;
      }

      if (
        index + 1 < lines.length &&
        next.includes("|") &&
        isTableSeparator(lines[index + 1])
      ) {
        break;
      }

      paragraphLines.push(next);
      index++;
    }

    elements.push(
      <Text
        key={`paragraph-${index}`}
        style={styles.bodyText}
      >
        {renderInline(
          paragraphLines.join(" ")
        )}
      </Text>
    );
  }

  return elements;
}

function renderInline(
  text: string
): React.ReactNode[] {
  const parts: InlinePart[] = [];

  let remaining = text;

  while (remaining.length > 0) {
    // Bold
    const bold = remaining.match(
      /^\*\*(.+?)\*\*/
    );

    if (bold) {
      parts.push({
        type: "bold",
        text: bold[1],
      });

      remaining = remaining.slice(
        bold[0].length
      );

      continue;
    }

    // Strike
    const strike = remaining.match(
      /^~~(.+?)~~/
    );

    if (strike) {
      parts.push({
        type: "strike",
        text: strike[1],
      });

      remaining = remaining.slice(
        strike[0].length
      );

      continue;
    }

    // Inline code
    const code = remaining.match(
      /^`(.+?)`/
    );

    if (code) {
      parts.push({
        type: "code",
        text: code[1],
      });

      remaining = remaining.slice(
        code[0].length
      );

      continue;
    }

    // Link
    const link = remaining.match(
      /^\[([^\]]+)\]\(([^)]+)\)/
    );

    if (link) {
      parts.push({
        type: "link",
        text: link[1],
        url: link[2],
      });

      remaining = remaining.slice(
        link[0].length
      );

      continue;
    }

    // Italic
    const italic = remaining.match(
      /^\*(.+?)\*/
    );

    if (italic) {
      parts.push({
        type: "italic",
        text: italic[1],
      });

      remaining = remaining.slice(
        italic[0].length
      );

      continue;
    }

    // Plain text
    let nextSpecial = remaining.length;

    const specialPatterns = [
      /\*\*/,
      /~~/,
      /`/,
      /\[/,
      /\*/,
    ];

    for (const pattern of specialPatterns) {
      const match = remaining.match(pattern);

      if (
        match &&
        match.index !== undefined
      ) {
        nextSpecial = Math.min(
          nextSpecial,
          match.index
        );
      }
    }

    if (nextSpecial === 0) {
      parts.push({
        type: "text",
        text: remaining[0],
      });

      remaining = remaining.slice(1);
      continue;
    }

    parts.push({
      type: "text",
      text: remaining.slice(
        0,
        nextSpecial
      ),
    });

    remaining = remaining.slice(
      nextSpecial
    );
  }

  return parts.map((part, index) => {
    const key = `${part.type}-${index}`;

    switch (part.type) {
      case "bold":
        return (
          <Text
            key={key}
            style={styles.bold}
          >
            {part.text}
          </Text>
        );

      case "italic":
        return (
          <Text
            key={key}
            style={styles.italic}
          >
            {part.text}
          </Text>
        );

      case "strike":
        return (
          <Text
            key={key}
            style={styles.strike}
          >
            {part.text}
          </Text>
        );

      case "code":
        return (
          <Text
            key={key}
            style={styles.inlineCode}
          >
            {part.text}
          </Text>
        );

      case "link":
        return (
          <Text
            key={key}
            style={styles.link}
          >
            {part.text}
          </Text>
        );

      default:
        return (
          <Text key={key}>
            {part.text}
          </Text>
        );
    }
  });
}

function isHorizontalRule(
  line: string
): boolean {
  return /^([-*_])(?:\s*\1){2,}$/.test(
    line
  );
}

function isTableSeparator(
  line: string
): boolean {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  return (
    cells.length > 0 &&
    cells.every((cell) =>
      /^:?-{3,}:?$/.test(cell)
    )
  );
}

function parseTable(
  lines: string[],
  startIndex: number
) {
  const headers = parseTableRow(
    lines[startIndex]
  );

  let index = startIndex + 2;

  const rows: string[][] = [];

  while (
    index < lines.length &&
    lines[index].trim() &&
    lines[index].includes("|")
  ) {
    rows.push(
      parseTableRow(lines[index])
    );

    index++;
  }

  return {
    headers,
    rows,
    nextIndex: index,
  };
}

function parseTableRow(
  line: string
): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function getHeadingStyle(level: number) {
  switch (level) {
    case 1:
      return styles.heading1;

    case 2:
      return styles.heading2;

    case 3:
      return styles.heading3;

    default:
      return styles.heading4;
  }
}

function MarkdownTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      style={styles.tableScroll}
    >
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {headers.map((header, index) => (
            <View
              key={`header-${index}`}
              style={styles.tableHeaderCell}
            >
              <Text style={styles.tableHeaderText}>
                {renderInline(header)}
              </Text>
            </View>
          ))}
        </View>

        {rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={styles.tableRow}
          >
            {headers.map(
              (_, columnIndex) => (
                <View
                  key={`cell-${rowIndex}-${columnIndex}`}
                  style={styles.tableCell}
                >
                  <Text style={styles.tableText}>
                    {renderInline(
                      row[columnIndex] ?? ""
                    )}
                  </Text>
                </View>
              )
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  bodyText: {
    fontFamily: FONT,
    fontSize: 17,
    lineHeight: 30,
    color: "#F4F5F7",
    marginBottom: 12,
  },

  heading: {
    fontFamily: FONT,
    color: "#F4F5F7",
    fontWeight: "700",
  },

  heading1: {
    fontSize: 30,
    lineHeight: 42,
    marginTop: 8,
    marginBottom: 16,
  },

  heading2: {
    fontSize: 25,
    lineHeight: 36,
    marginTop: 16,
    marginBottom: 12,
  },

  heading3: {
    fontSize: 21,
    lineHeight: 32,
    marginTop: 12,
    marginBottom: 8,
  },

  heading4: {
    fontSize: 19,
    lineHeight: 29,
    marginTop: 8,
    marginBottom: 6,
  },

  bold: {
    fontFamily: FONT,
    fontWeight: "700",
  },

  italic: {
    fontFamily: FONT,
    fontStyle: "italic",
  },

  strike: {
    fontFamily: FONT,
    textDecorationLine: "line-through",
  },

  inlineCode: {
    fontFamily: FONT,
    backgroundColor: "#1A1E24",
  },

  link: {
    fontFamily: FONT,
    textDecorationLine: "underline",
  },

  paragraphSpacing: {
    height: 6,
  },

  horizontalRule: {
    height: 1,
    backgroundColor: "#343A43",
    marginVertical: 16,
  },

  listContainer: {
    marginBottom: 10,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 6,
  },

  number: {
    width: 32,
    fontFamily: FONT,
    fontSize: 17,
    lineHeight: 30,
    color: "#F4F5F7",
  },

  bullet: {
    width: 26,
    fontFamily: FONT,
    fontSize: 19,
    lineHeight: 30,
    color: "#F4F5F7",
  },

  quoteContainer: {
    borderLeftWidth: 3,
    borderLeftColor: "#8AB4F8",
    paddingLeft: 14,
    marginVertical: 10,
  },

  quoteText: {
    fontFamily: FONT,
    fontSize: 17,
    lineHeight: 30,
    color: "#B5BDC8",
  },

  tableScroll: {
    marginVertical: 12,
  },

  table: {
    borderWidth: 1,
    borderColor: "#3A414C",
  },

  tableRow: {
    flexDirection: "row",
  },

  tableHeaderCell: {
    minWidth: 180,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#171B21",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#3A414C",
  },

  tableHeaderText: {
    fontFamily: FONT,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "700",
    color: "#F4F5F7",
  },

  tableCell: {
    minWidth: 180,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#3A414C",
  },

  tableText: {
    fontFamily: FONT,
    fontSize: 16,
    lineHeight: 25,
    color: "#F4F5F7",
  },
});