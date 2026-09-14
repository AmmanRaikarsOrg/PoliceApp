import {
  AlignmentType,
  Document,
} from "docx";

export const DOCUMENT_FONT = "Nudi 05 e";

export const DOCUMENT_STYLES = {
  normal: {
    font: DOCUMENT_FONT,
    size: 24,
  },

  heading1: {
    font: DOCUMENT_FONT,
    size: 32,
    bold: true,
  },

  heading2: {
    font: DOCUMENT_FONT,
    size: 28,
    bold: true,
  },

  heading3: {
    font: DOCUMENT_FONT,
    size: 26,
    bold: true,
  },
};

export function createDocument() {
  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: DOCUMENT_FONT,
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

        children: [],
      },
    ],
  });
}