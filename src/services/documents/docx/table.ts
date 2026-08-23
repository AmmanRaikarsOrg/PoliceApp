import {
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

function getColumnWidths(
  headers: string[],
  rows: string[][]
): number[] {
  const columnCount = headers.length;

  const maxLengths = headers.map(
    (header, index) => {
      const values = [
        header,
        ...rows.map(
          (row) => row[index] ?? ""
        ),
      ];

      return Math.max(
        ...values.map(
          (value) => value.length
        )
      );
    }
  );

  const total = maxLengths.reduce(
    (sum, value) => sum + value,
    0
  );

  // Total table width in DXA.
  const totalWidth = 9000;

  return maxLengths.map(
    (length) =>
      Math.max(
        1200,
        Math.floor(
          (length / total) * totalWidth
        )
      )
  );
}

function createCell(
  text: string,
  width: number,
  bold = false
) {
  return new TableCell({
    width: {
      size: width,
      type: WidthType.DXA,
    },

    margins: {
      top: 100,
      bottom: 100,
      left: 120,
      right: 120,
    },

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            font: "NudiE05",
            size: 22,
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
  const widths = getColumnWidths(
    headers,
    rows
  );

  const headerRow = new TableRow({
    children: headers.map(
      (header, index) =>
        createCell(
          header,
          widths[index],
          true
        )
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: headers.map(
          (_, index) =>
            createCell(
              row[index] ?? "",
              widths[index]
            )
        ),
      })
  );

  return new Table({
    width: {
      size: 9000,
      type: WidthType.DXA,
    },

    rows: [
      headerRow,
      ...dataRows,
    ],
  });
}