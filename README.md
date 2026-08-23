# Police App

React Native + Expo SDK 54 application using React Navigation. There is no signup.

## Application Flow

Auth login screen -> Home screen -> Make New Case -> metadata popup -> Complaint Registration audio screen -> Case Page -> Add New Document -> Document Generation audio screen -> Case Page.

The Case Page -> Document Generation -> Case Page flow repeats.

## Root Files and Folders

- `app.json`: Expo application configuration, including font and audio configuration.
- `App.tsx`: Root component containing the navigation container and status bar.
- `index.js`: Registers `App` with Expo.
- `package.json`: Dependencies and project commands.
- `package-lock.json`: Locked dependency versions.
- `tsconfig.json`: TypeScript configuration.
- `.env.example`: Example environment variable file.
- `src/`: Application source code.
- `node_modules/`: Installed dependencies.
- `.expo/`: Expo-generated local project data.
- `.git/`: Git repository data.
- `.gitignore`: Git ignore rules.
- `.vscode/`: VS Code workspace settings.

## `src` Folders and Files

- `global.css`: Global styles.
- `assets/`: Application assets.
    - `fonts/`: Font assets.
        - `NudiE05.ttf`: Required Nudi E05 font.
        - `.gitkeep`: Keeps the font folder tracked.
    - `icons/`: Icon assets; currently empty.
    - `images/`: Image assets.
        - `.gitkeep`: Keeps the images folder tracked.
- `components/`: Reusable presentation components.
    - `audio/`: Audio recording, uploading, playback, listing, and reordering UI.
        - `AudioItem.tsx`: One audio item.
        - `AudioList.tsx`: List of audio items.
        - `AudioPlayer.tsx`: Audio playback UI.
        - `AudioRecorder.tsx`: Audio recording UI.
        - `AudioUploader.tsx`: Pre-recorded audio upload UI.
    - `auth/`: Login UI.
        - `LoginForm.tsx`: Login form; there is no signup form.
    - `cases/`: Case search, filtering, display, and creation UI.
        - `CaseCard.tsx`: One case in the case grid.
        - `CaseGrid.tsx`: Google Drive-style case grid.
        - `CaseSearchBar.tsx`: Case search bar.
        - `CaseStatusFilter.tsx`: OPEN, ONGOING, and CLOSED filter controls.
        - `CaseTypeFilter.tsx`: Case type filter controls.
        - `CreateCaseModal.tsx`: New-case metadata popup; Case Name is mandatory.
    - `common/`: Shared UI components.
        - `Button.tsx`: Shared button.
        - `EmptyState.tsx`: Empty content state.
        - `ErrorState.tsx`: Error content state.
        - `Input.tsx`: Shared input.
        - `Loading.tsx`: Loading state.
        - `Modal.tsx`: Shared popup container.
    - `documents/`: Document display and template UI.
        - `DocumentCard.tsx`: One generated document.
        - `DocumentList.tsx`: Generated document list.
        - `MarkdownViewer.tsx`: Displays backend Markdown.
        - `TemplateSelector.tsx`: Selects the document template.
- `context/`: Shared application state.
    - `AuthContext.tsx`: Authentication state.
- `hooks/`: Reusable stateful logic.
    - `useAudioRecorder.ts`: Recording logic.
    - `useAuth.ts`: Authentication access logic.
    - `useCases.ts`: Case data and case workflow logic.
    - `useDocuments.ts`: Document data and document workflow logic.
- `navigation/`: React Navigation configuration.
    - `AppNavigator.tsx`: Auth, Home, Complaint Registration, Case Page, and Document Generation routes.
    - `types.ts`: Navigation route types.
- `screens/`: Application screens.
    - `AuthScreen.tsx`: Login screen.
    - `HomeScreen.tsx`: Profile icon, search, filters, case grid, and bottom-right Make New Case button.
    - `ComplaintRegistrationScreen.tsx`: Centrally records audio, uploads pre-recorded audio, lists audio for preview and reordering, and accepts optional extra instructions.
    - `CasePageScreen.tsx`: Shows complaint information and generated documents; supports adding documents, replacing the complaint, regenerating documents, and changing case type and status.
    - `DocumentGenerationScreen.tsx`: Records/uploads audio and selects a document template.
- `services/`: Backend and native-service access.
    - `api/`: API access.
        - `client.ts`: API client.
        - `endpoints.ts`: API endpoint definitions.
    - `audio/`: Audio service.
        - `audioService.ts`: SDK 54-compatible audio operations.
    - `auth/`: Authentication service.
        - `authService.ts`: Login service operations.
    - `cases/`: Case service.
        - `caseService.ts`: Case backend operations.
    - `documents/`: Document service.
        - `documentService.ts`: Document backend operations.
        - `markdownToWord.ts`: Converts Markdown to Word on the frontend.
- `theme/`: Visual design values.
    - `color.ts`: Colors.
    - `index.ts`: Theme exports.
    - `spacing.ts`: Spacing values.
    - `typography.ts`: Typography values.
- `utils/`: Shared application definitions and helpers.
    - `constants.ts`: Shared constants.
    - `formatting.ts`: Formatting helpers.
    - `types.ts`: Shared data types.
    - `validation.ts`: Input validation.

## Data Rules

- The backend is a Node backend configured by `EXPO_PUBLIC_API_URL`.
- Backend calls belong in services, accessed through hooks by screens.
- The backend returns Markdown strings for display.
- Document templates include Panchanama, Letter, Request, and Chargesheet; the exact list comes from the backend.
- Case metadata includes Case Name, Case Description, Case Type, and Date. Case Name is mandatory.
- Case statuses are OPEN, ONGOING, and CLOSED.