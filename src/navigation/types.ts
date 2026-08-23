export type RootStackParamList = {
  Auth: undefined;

  Home: undefined;

  ComplaintRegistration: {
    caseId: string;
  };

  CasePage: {
    caseId: string;
  };

  DocumentGeneration: {
    caseId: string;
  };
};