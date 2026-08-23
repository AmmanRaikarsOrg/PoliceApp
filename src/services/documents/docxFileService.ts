import {
  File,
  Paths,
} from "expo-file-system";

import * as Sharing from "expo-sharing";

import {
  markdownToDocx,
} from "./markdownToWord";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function createDocxFile(
  markdown: string,
  filename = "case-document.docx"
): Promise<string> {
  const bytes =
    await markdownToDocx(markdown);

  const file = new File(
    Paths.cache,
    filename
  );

  if (file.exists) {
    file.delete();
  }

  file.create();

  file.write(bytes);

  return file.uri;
}

export async function createAndShareDocx(
  markdown: string,
  filename = "case-document.docx"
) {
  const uri =
    await createDocxFile(
      markdown,
      filename
    );

  const sharingAvailable =
    await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "File sharing is not available."
    );
  }

  await Sharing.shareAsync(uri, {
    mimeType: DOCX_MIME,
    dialogTitle: "Share Word Document",
  });

  return uri;
}