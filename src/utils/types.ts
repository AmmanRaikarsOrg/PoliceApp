export type CaseStatus =
  | "OPEN"
  | "ONGOING"
  | "CLOSED";

export type Case = {
  id: string;
  name: string;
  description?: string;
  type?: string;
  date?: string;
  status: CaseStatus;
};

export type Recording = {
  id: string;
  name: string;
  uri: string;
  order: number;
};

export type Document = {
  id: string;
  name: string;
  template: string;
  markdown: string;
};