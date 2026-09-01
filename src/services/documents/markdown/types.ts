export type MarkdownDocument = {
  blocks: MarkdownBlock[];
};

export type MarkdownBlock =
  | HeadingBlock
  | ParagraphBlock
  | BulletListBlock
  | OrderedListBlock
  | BlockquoteBlock
  | TableBlock
  | HorizontalRuleBlock;

export type HeadingBlock = {
  type: "heading";
  level: number;
  content: string;
};

export type ParagraphBlock = {
  type: "paragraph";
  content: string;
};

export type BulletListBlock = {
  type: "bullet-list";
  items: string[];
};

export type OrderedListBlock = {
  type: "ordered-list";
  items: string[];
};

export type BlockquoteBlock = {
  type: "blockquote";
  content: string;
};

export type TableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
};

export type HorizontalRuleBlock = {
  type: "horizontal-rule";
};