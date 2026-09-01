export type RootStackParamList = {
  Auth: undefined;

  Home: undefined;

  ComplaintRegistration: {
    caseId: string;
  };

  CasePage: {
    caseId: string;
    newDocumentName?: string;
  };

  DocumentGeneration: {
    caseId: string;
  };

  MarkdownDocxTest: undefined;

  MarkdownPreview: undefined;

  NudiFontTest: undefined;
};