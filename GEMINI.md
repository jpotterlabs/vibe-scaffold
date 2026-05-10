# GEMINI.md

This file provides architectural context and development guidelines for the Vibe Scaffold project.

## Project Overview
**Vibe Scaffold** is a Next.js 15.1.0 application that implements a multi-step wizard interface for generating technical specification documents using AI-powered chat.

### Core Workflow
The application follows a sequential 4-step process. Each step consists of:
1.  **Chat Phase**: Interactive conversation with the "Vibe Scaffold Assistant" to gather requirements.
2.  **Generation Phase**: AI synthesizes the chat history (and previous documents) into a structured Markdown document.
3.  **Approval Phase**: The user reviews and approves the document to proceed to the next step.

### Document Sequence
1.  **Step 1 - One Pager**: Product vision and MVP requirements.
2.  **Step 2 - Dev Spec**: Technical architecture, API design, and data models.
3.  **Step 3 - Prompt Plan**: Staged development plan with AI-ready prompts.
4.  **Step 4 - AGENTS.md**: Agent guidance and workflow documentation.

## Tech Stack
- **Framework**: Next.js 15.1.0 (App Router, Edge Runtime for APIs)
- **Language**: TypeScript
- **State Management**: Zustand with `localStorage` persistence (`wizard-storage`)
- **Styling**: Tailwind CSS v3.4
- **AI Integration**: Vercel AI SDK (`ai` package), multi-provider support (OpenAI, OpenRouter, Ollama, Anthropic) via `app/utils/ai.ts`.
- **Testing**: Vitest with `@testing-library/react`
- **Utilities**: JSZip (for ZIP downloads), React Markdown (for rendering)

## Core Architecture

### AI Provider Strategy (`app/utils/ai.ts`)
The project uses a central utility to instantiate AI models.
- **`AI_PROVIDER`**: Environment variable to select the provider ("openai", "openrouter", "ollama", "anthropic", "custom").
- **`OPENAI_MODEL`**: The specific model name to use (e.g., `gpt-4o`, `google/gemini-2.0-flash-001`).
- **OpenRouter & Ollama**: Supported via OpenAI-compatible interfaces.

### State Management (`app/store.ts`, `app/types.ts`)
The application uses a single Zustand store with persistence.
- **Persistence Key**: `wizard-storage`
- **Data Structure**: `steps` object containing `chatHistory`, `generatedDoc`, and `approved` status for each step.
- **Transients**: `isGenerating` is not persisted.

### Context-Aware Generation
Steps are context-aware. Later steps receive the generated documents from earlier steps as part of their prompt.
- **Configuration**: Defined in `documentInputs` within `app/wizard/steps/stepN-config.ts`.
- **Flow**: Step 2 receives Step 1; Step 3 receives Step 1 & 2; Step 4 receives Steps 1, 2, & 3.

### Chat & Streaming (`app/wizard/components/ChatInterface.tsx`)
The application uses a **custom streaming implementation** instead of the standard `useChat` hook from the AI SDK due to specific version compatibility requirements.
- **Endpoints**: `/api/chat` and `/api/generate-doc` return raw text streams.
- **Processing**: The frontend reads the stream reader and manually appends chunks to the message content.

## Key File Map
- `app/wizard/page.tsx`: Main orchestrator for the wizard UI and navigation.
- `app/wizard/components/WizardStep.tsx`: Handles the logic for a single step (chat, generation, preview).
- `app/wizard/steps/`: Configuration files for each of the 4 steps.
- `app/api/`: Edge Runtime API routes for AI interactions and logging.
- `app/store.ts`: Central state management.
- `app/types.ts`: Core TypeScript interfaces.
- `tests/`: Extensive test suite (Unit and Integration).

## Building and Running
- `npm run dev`: Starts the development server.
- `npm run build`: Cleans up test data and builds for production.
- `npm run lint`: Runs ESLint.
- `npm test`: Runs all Vitest tests.
- `npm run test:watch`: Runs tests in watch mode.

## Development Conventions

### API Routes
- **Runtime**: MUST use **Edge Runtime** (`export const runtime = "edge";`).
- **Models**: Configured via `OPENAI_MODEL` environment variable (defaults to `gpt-4o`).

### File Naming
All generated and downloaded documents MUST follow the naming convention:
- **Format**: `UPPER_CASE_WITH_UNDERSCORES.md`
- **Example**: `ONE_PAGER.md`, `DEV_SPEC.md`.

### Testing Requirements
- **Mandatory Verification**: Always run `npm test` before committing changes.
- **New Features**: Must include corresponding unit tests in `tests/unit/` or integration tests in `tests/integration/`.
- **Manual Testing**: Verify that `localStorage` persistence works (refresh page after a change) and that "Reset Wizard" correctly clears state.

### Automated Agent Guardrails
- **Do not break the 3-phase flow** (Chat -> Generation -> Approval).
- **Do not change `localStorage` keys** without a migration plan.
- **Respect the Edge Runtime constraints** in API routes.
- **Update `AGENTS.md`** if significant architectural changes are made.

## Instruction for Future Interactions
When working on this project, prioritize maintaining the sequential flow and state persistence. Always check `app/types.ts` before modifying state-related code. If adding a new step or modifying AI behavior, refer to the corresponding `stepN-config.ts` file.
