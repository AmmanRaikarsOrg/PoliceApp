import {
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  VerticalAlign,
  BorderStyle,
} from "docx";

const FONT = "Nudi 05 e";

const TABLE_WIDTH = 9000;

function calculateColumnWidths(
  headers: string[],
  rows: string[][]
): number[] {
  const columnCount =
    headers.length;

  const maxLengths =
    Array.from(
      { length: columnCount },
      (_, columnIndex) => {
        const values = [
          headers[columnIndex] ?? "",
          ...rows.map(
            (row) =>
              row[columnIndex] ?? ""
          ),
        ];

        return Math.max(
          ...values.map(
            (value) => value.length
          ),
          1
        );
      }
    );

  const totalLength =
    maxLengths.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const minimumWidth = 1200;

  let widths = maxLengths.map(
    (length) =>
      Math.max(
        minimumWidth,
        Math.round(
          (length / totalLength) *
            TABLE_WIDTH
        )
      )
  );

  // Correct rounding so total is exactly TABLE_WIDTH.
  const currentTotal =
    widths.reduce(
      (sum, width) =>
        sum + width,
      0
    );

  widths[widths.length - 1] +=
    TABLE_WIDTH - currentTotal;

  return widths;
}

function createCell(
  text: string,
  width: number,
  header = false
) {
  return new TableCell({
    width: {
      size: width,
      type: WidthType.DXA,
    },

    margins: {
      top: 120,
      bottom: 120,
      left: 120,
      right: 120,
    },

    verticalAlign:
      VerticalAlign.CENTER,

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 22,
            bold: header,
          }),
        ],
      }),
    ],
  });
}

export function createMarkdownTable(
  headers: string[],
  rows: string[][]
) {
  const widths =
    calculateColumnWidths(
      headers,
      rows
    );

  const headerRow =
    new TableRow({
      children: headers.map(
        (header, index) =>
          createCell(
            header,
            widths[index],
            true
          )
      ),
    });

  const dataRows =
    rows.map(
      (row) =>
        new TableRow({
          children:
            headers.map(
              (_, columnIndex) =>
                createCell(
                  row[
                    columnIndex
                  ] ?? "",
                  widths[
                    columnIndex
                  ]
                )
            ),
        })
    );

  return new Table({
    width: {
      size: TABLE_WIDTH,
      type: WidthType.DXA,
    },

    borders: {
      top: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "808080",
      },

      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "808080",
      },

      left: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "808080",
      },

      right: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "808080",
      },

      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 4,
        color: "B0B0B0",
      },

      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 4,
        color: "B0B0B0",
      },
    },

    rows: [
      headerRow,
      ...dataRows,
    ],
  });
}