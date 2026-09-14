import { TextRun } from "docx";

export function parseInline(
  text: string
): TextRun[] {
  const runs: TextRun[] = [];

  let remaining = text;

  while (remaining.length > 0) {
    // Bold
    const boldMatch =
      remaining.match(/^\*\*(.+?)\*\*/);

    if (boldMatch) {
      runs.push(
        new TextRun({
          text: boldMatch[1],
          bold: true,
        })
      );

      remaining =
        remaining.slice(boldMatch[0].length);

      continue;
    }

    // Italic
    const italicMatch =
      remaining.match(/^\*(.+?)\*/);

    if (italicMatch) {
      runs.push(
        new TextRun({
          text: italicMatch[1],
          italics: true,
        })
      );

      remaining =
        remaining.slice(italicMatch[0].length);

      continue;
    }

    // Strikethrough
    const strikeMatch =
      remaining.match(/^~~(.+?)~~/);

    if (strikeMatch) {
      runs.push(
        new TextRun({
          text: strikeMatch[1],
          strike: true,
        })
      );

      remaining =
        remaining.slice(strikeMatch[0].length);

      continue;
    }

    // Plain text
    let nextSpecial = remaining.length;

    const patterns = [
      /\*\*/,
      /\*/,
      /~~/,
    ];

    for (const pattern of patterns) {
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

    runs.push(
      new TextRun({
        text: remaining.slice(0, nextSpecial),
      })
    );

    remaining =
      remaining.slice(nextSpecial);
  }

  return runs;
}