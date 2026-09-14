import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";

import type {
  MarkdownBlock,
  MarkdownDocument,
} from "../markdown/types";

import {
  createMarkdownTable,
} from "./table";

import { DOCUMENT_FONT } from "./styles";

const FONT = DOCUMENT_FONT;

function createInlineRuns(
  text: string
): TextRun[] {
  const runs: TextRun[] = [];

  let remaining = text;

  while (remaining.length > 0) {
    // Bold
    const bold = remaining.match(
      /^\*\*(.+?)\*\*/
    );

    if (bold) {
      runs.push(
        new TextRun({
          text: bold[1],
          font: FONT,
          bold: true,
        })
      );

      remaining = remaining.slice(
        bold[0].length
      );

      continue;
    }

    // Italic
    const italic = remaining.match(
      /^\*(.+?)\*/
    );

    if (italic) {
      runs.push(
        new TextRun({
          text: italic[1],
          font: FONT,
          italics: true,
        })
      );

      remaining = remaining.slice(
        italic[0].length
      );

      continue;
    }

    // Strikethrough
    const strike = remaining.match(
      /^~~(.+?)~~/
    );

    if (strike) {
      runs.push(
        new TextRun({
          text: strike[1],
          font: FONT,
          strike: true,
        })
      );

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
      runs.push(
        new TextRun({
          text: code[1],
          font: FONT,
        })
      );

      remaining = remaining.slice(
        code[0].length
      );

      continue;
    }

    // Plain text
    let nextSpecial = remaining.length;

    const patterns = [
      /\*\*/,
      /\*/,
      /~~/,
      /`/,
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
        text: remaining.slice(
          0,
          nextSpecial
        ),
        font: FONT,
      })
    );

    remaining = remaining.slice(
      nextSpecial
    );
  }

  return runs;
}

function createParagraph(
  content: string
) {
  return new Paragraph({
    children: createInlineRuns(content),

    spacing: {
      after: 160,
      line: 360,
    },

    alignment: AlignmentType.JUSTIFIED,
  });
}

function createHeading(
  content: string,
  level: number
) {
  let headingLevel:
    | typeof HeadingLevel.HEADING_1
    | typeof HeadingLevel.HEADING_2
    | typeof HeadingLevel.HEADING_3;

  if (level === 1) {
    headingLevel = HeadingLevel.HEADING_1;
  } else if (level === 2) {
    headingLevel = HeadingLevel.HEADING_2;
  } else {
    headingLevel = HeadingLevel.HEADING_3;
  }

  return new Paragraph({
    heading: headingLevel,

    children: [
      new TextRun({
        text: content,
        font: FONT,
        bold: true,
      }),
    ],

    spacing: {
      before: 240,
      after: 160,
    },
  });
}

function createBullet(
  content: string
) {
  return new Paragraph({
    children: createInlineRuns(content),

    bullet: {
      level: 0,
    },

    spacing: {
      after: 80,
    },
  });
}

function createNumbered(
  content: string,
  number: number
) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${number}. `,
        font: FONT,
      }),

      ...createInlineRuns(content),
    ],

    indent: {
      left: 720,
      hanging: 360,
    },

    spacing: {
      after: 80,
    },
  });
}

function createBlockquote(
  content: string
) {
  return new Paragraph({
    children: [
      new TextRun({
        text: content,
        font: FONT,
        italics: true,
      }),
    ],

    indent: {
      left: 720,
    },

    border: {
      left: {
        color: "808080",
        space: 8,
        style: BorderStyle.SINGLE,
        size: 12,
      },
    },

    spacing: {
      after: 160,
    },
  });
}

function createHorizontalRule() {
  return new Paragraph({
    border: {
      bottom: {
        color: "808080",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },

    spacing: {
      after: 160,
    },
  });
}

function blockToDocx(
  block: MarkdownBlock
): Paragraph | Paragraph[] | ReturnType<typeof createMarkdownTable> {
  switch (block.type) {
    case "heading":
      return createHeading(
        block.content,
        block.level
      );

    case "paragraph":
      return createParagraph(
        block.content
      );

    case "bullet-list":
      return block.items.map(
        (item) => createBullet(item)
      );

    case "ordered-list":
      return block.items.map(
        (item, index) =>
          createNumbered(
            item,
            index + 1
          )
      );

    case "blockquote":
      return createBlockquote(
        block.content
      );

    case "horizontal-rule":
      return createHorizontalRule();

    case "table":
      return createMarkdownTable(
        block.headers,
        block.rows
      );
  }
}

export async function generateDocx(
  markdownDocument: MarkdownDocument
): Promise<Uint8Array> {
  const children = markdownDocument.blocks.flatMap(
    (block) => {
      const result =
        blockToDocx(block);

      return Array.isArray(result)
        ? result
        : [result];
    }
  );

  const document = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: 24,
          },

          paragraph: {
            spacing: {
              after: 160,
            },
          },
        },
      },
    },

    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },

        children,
      },
    ],
  });

  const arrayBuffer =
    await Packer.toArrayBuffer(
      document
    );

  return new Uint8Array(
    arrayBuffer
  );
}