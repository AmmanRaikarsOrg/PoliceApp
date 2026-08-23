import {
  AlignmentType,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import {
  createDocument,
} from "./styles";

import {
  createMarkdownTable,
} from "./table";

import {
  parseInline,
} from "../markdown/inlineParser";

import type {
  MarkdownBlock,
  MarkdownDocument,
} from "../markdown/types";

function createBlock(
  block: MarkdownBlock
) {
  switch (block.type) {
    case "heading": {
      const heading =
        block.level === 1
          ? HeadingLevel.HEADING_1
          : block.level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;

      return new Paragraph({
        heading,
        children: parseInline(
          block.content
        ),
      });
    }

    case "paragraph":
      return new Paragraph({
        children: parseInline(
          block.content
        ),
      });

    case "bullet-list":
      return block.items.map(
        (item) =>
          new Paragraph({
            text: item,
            bullet: {
              level: 0,
            },
          })
      );

    case "ordered-list":
      return block.items.map(
        (item) =>
          new Paragraph({
            text: item,
            numbering: {
              reference: "default-numbering",
              level: 0,
            },
          })
      );

    case "blockquote":
      return new Paragraph({
        children: [
          new TextRun({
            text: block.content,
            italics: true,
          }),
        ],
        indent: {
          left: 720,
        },
      });

    case "table":
      return createMarkdownTable(
        block.headers,
        block.rows
      );

    case "horizontal-rule":
      return new Paragraph({
        border: {
          bottom: {
            color: "808080",
            space: 1,
            style: "single",
            size: 6,
          },
        },
      });
  }
}

export async function generateDocx(
  markdownDocument: MarkdownDocument
): Promise<Uint8Array> {
  const document =
    createDocument();

  const children = markdownDocument.blocks.flatMap(
    (block) => {
      const result = createBlock(block);

      return Array.isArray(result)
        ? result
        : [result];
    }
  );

  (
    document as unknown as {
      addSection: (
        section: {
          children: unknown[];
        }
      ) => void;
    }
  ).addSection({
    children,
  });

  const buffer =
    await Packer.toArrayBuffer(
      document
    );

  return new Uint8Array(buffer);
}