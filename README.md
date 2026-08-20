# Case Files — Clean Expo Router Scaffold

This project uses Expo Router with the supported top-level `src/app` routing directory.

## Rule
`src/app` is for routes only. Put actual UI in `src/screens`, reusable UI in `src/components`, backend/native integrations in `src/services`, helpers/types in `src/utils`, and static resources in `src/assets`.

## Structure

PoliceApp/
- app.json
- package.json
- tsconfig.json
- README.md
- .env.example
- src/
  - app/                 # Expo Router routes ONLY
    - _layout.tsx
    - index.tsx
    - case/[caseId]/
      - index.tsx
      - audio.tsx
      - files.tsx
      - templates.tsx
      - document/[fileId].tsx
  - screens/
  - components/
  - services/
  - utils/
  - assets/fonts/NudiE05.ttf
  - assets/images/

## Routes

/ — Home
/case/:caseId — Case
/case/:caseId/audio — Audio + instructions
/case/:caseId/files — Generated files
/case/:caseId/templates — Template selection
/case/:caseId/document/:fileId — Markdown document

## Entry

`package.json` uses `expo-router/entry`. There is intentionally no App.tsx, custom index.js, AppNavigator, or React Navigation route types.

## Install / run

```bash
npm install
npx expo start --clear
```

## Nudi E05

Put the licensed font at `src/assets/fonts/NudiE05.ttf`.

## Navigation

Use Expo Router:

```tsx
import { router, useLocalSearchParams } from "expo-router";
router.push(`/case/${caseId}/audio`);
router.back();
const { caseId } = useLocalSearchParams<{caseId: string}>();
```

