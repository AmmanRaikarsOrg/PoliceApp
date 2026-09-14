export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  ComplaintRegistration: { caseId: string };
  CasePage: { caseId: string; newDocumentName?: string; docType?: string; generatingDocId?: string };
  DocumentGeneration: { caseId: string; docType?: string };
  MarkdownDocxTest: undefined;
  MarkdownPreview: { markdown?: string; title?: string; subtitle?: string; caseId?: string; documentId?: string; };
  NudiFontTest: undefined;
};