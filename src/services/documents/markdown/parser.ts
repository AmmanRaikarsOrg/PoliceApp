import type {
  MarkdownBlock,
  MarkdownDocument,
} from "./types";

function isTableSeparator(line: string): boolean {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  if (cells.length === 0) {
    return false;
  }

  return cells.every((cell) =>
    /^:?-{3,}:?$/.test(cell)
  );
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseMarkdown(
  markdown: string
): MarkdownDocument {
  const lines = markdown
    .replace(/\r\n/g, "\n")
    .split("\n");

  const blocks: MarkdownBlock[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Empty line
    if (!line) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^([-*_])(?:\s*\1){2,}$/.test(line)) {
      blocks.push({
        type: "horizontal-rule",
      });

      i++;
      continue;
    }

    // Heading
    const headingMatch =
      line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });

      i++;
      continue;
    }

    // Table
    if (
      i + 1 < lines.length &&
      line.includes("|") &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = parseTableRow(line);

      i += 2;

      const rows: string[][] = [];

      while (
        i < lines.length &&
        lines[i].trim() &&
        lines[i].includes("|")
      ) {
        rows.push(parseTableRow(lines[i]));
        i++;
      }

      blocks.push({
        type: "table",
        headers,
        rows,
      });

      continue;
    }

    // Bullet list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];

      while (
        i < lines.length &&
        /^[-*+]\s+/.test(lines[i].trim())
      ) {
        items.push(
          lines[i]
            .trim()
            .replace(/^[-*+]\s+/, "")
        );

        i++;
      }

      blocks.push({
        type: "bullet-list",
        items,
      });

      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (
        i < lines.length &&
        /^\d+\.\s+/.test(lines[i].trim())
      ) {
        items.push(
          lines[i]
            .trim()
            .replace(/^\d+\.\s+/, "")
        );

        i++;
      }

      blocks.push({
        type: "ordered-list",
        items,
      });

      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const content = line
        .replace(/^>\s?/, "")
        .trim();

      blocks.push({
        type: "blockquote",
        content,
      });

      i++;
      continue;
    }

    // Paragraph
    const paragraphLines = [line];

    i++;

    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,6}\s+/.test(lines[i].trim()) &&
      !/^[-*+]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith(">") &&
      !(
        i + 1 < lines.length &&
        lines[i].includes("|") &&
        isTableSeparator(lines[i + 1])
      )
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" "),
    });
  }

  return {
    blocks,
  };
}