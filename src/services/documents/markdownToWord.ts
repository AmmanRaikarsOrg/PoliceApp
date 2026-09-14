import {
  parseMarkdown,
} from "./markdown/parser";

import {
  generateDocx,
} from "./docx/generator";

export async function markdownToDocx(
  markdown: string
): Promise<Uint8Array> {
  const parsed =
    parseMarkdown(markdown);

  return generateDocx(parsed);
}