import React from "react";
import Markdown from "react-native-markdown-display";

type Props = {
  markdown: string;
};

export function MarkdownViewer({
  markdown,
}: Props) {
  return (
    <Markdown>
      {markdown}
    </Markdown>
  );
}