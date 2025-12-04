# Gemini RAG Demo

## Overview
This is a React-based Retrieval Augmented Generation (RAG) demonstration interface. The application enables users to interact with a knowledge base powered by **Google's Gemini File Search API**, orchestrated via **n8n workflows**.

Users can upload documents to a synchronized Google Drive folder, view the library, and chat with an AI agent that provides grounded answers with citations linking back to the source documents.

## Key Features & Recent Enhancements

### 1. Rich Text Chat (Markdown)
*   **Markdown Rendering**: The chat interface now supports full Markdown formatting. Bold text (`**text**`), bullet points, and numbered lists are rendered cleanly using the `marked` library and custom CSS typography.
*   **Hybrid Rendering**: The application intelligently injects interactive citation buttons into the rendered Markdown HTML, ensuring formatting and functionality coexist without breaking.

### 2. Intelligent Citation Handling
The application implements a sophisticated logic to handle references returned by the LLM:
*   **Inline Citations**: Preserves all citation markers in the text (e.g., `[1]`, `[5]`). Even if multiple markers refer to the same document, they remain clickable and distinct in the flow of conversation.
*   **Deduplicated Source List**: The "Sources" footer at the bottom of the message is automatically filtered. It displays each unique document only once, keeping the interface clean even if the text references the same file multiple times.
*   **Multilingual Support**: Automatically detects and parses headers like "References:", "Sources:", or "Références :" (French).
*   **Smart Linking**: Constructs search-based URLs (`https://drive.google.com/drive/search?q=...`) to reliably locate files in the Google Drive folder, solving issues where the LLM might hallucinate direct file IDs.

### 3. Authentication
*   **Mock Authentication**: A simple "Sign In" toggle is implemented for demonstration purposes to unlock the UI.

### 4. Upload Workflow
*   **Direct Drive Access**: To ensure reliability and simplicity, the "Upload" view guides users to open the specific **Google Drive folder** directly.
*   **Background Sync**: An external n8n scheduler watches this folder and handles the indexing to Gemini File Search automatically.

### 5. Document Library
*   **Mock View**: Displays a list of files currently available in the knowledge base.
*   **Sync Simulation**: Includes a "Refresh" button to simulate fetching the latest file list from the backend.

## Technical Architecture

*   **Frontend**: React 19
*   **Styling**: Tailwind CSS + Custom Markdown CSS
*   **Markdown Parser**: `marked` library
*   **Icons**: Lucide React
*   **Backend**: n8n Workflows (Webhooks)

### Configuration Constants

To adapt this project for your own infrastructure, update the following constants:

#### Google Drive Folder
Located in `components/UploadView.tsx`, `components/ChatView.tsx`, and `components/LibraryView.tsx`:
```typescript
const DRIVE_FOLDER_ID = "1pDHcsAyUSr2D-WRGJvnoE-2sOPaCk3Zz"; // Replace with your Folder ID
```

#### n8n Chat Webhook
Located in `components/ChatView.tsx`:
```typescript
const response = await fetch('https://anneroyam.app.n8n.cloud/webhook/chat', { ... });
```

## Setup & Usage

1.  **Configure n8n**: Ensure your n8n workflow accepts a `POST` request with `{ "message": "...", "sessionId": "..." }` and returns a JSON with `{ "answer": "...", "citations": [...] }`.
2.  **Configure Drive**: Share the Google Drive folder so that the generated search links work for your users.
3.  **Run Application**: The app expects a standard React/Vite environment.
4.  Modify the component ChatView.tsx to identify the n8n webhook as follows
5.  try {
  const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.NEXT_PUBLIC_N8N_API_KEY
    },
    body: JSON.stringify({ 
      message: userMsg.text,
      sessionId: sessionIdRef.current
    })
  });

## Logic Deep Dive: Citations
The `ChatView.tsx` component performs the following steps when a message is received:
1.  **Extraction**: Regex parsing extracts citations from the raw text (if structured JSON isn't provided).
2.  **Normalization**: URLs are cleaned, and filenames are processed to create robust search queries.
3.  **State Update**: The full list of citations is attached to the message object.
4.  **Rendering**:
    *   `renderStyledText`: Parses Markdown -> Injects Buttons for every ID found in the text.
    *   `Sources Footer`: Iterates through the citations, creates a `Map` by title/URL to remove duplicates, and renders the unique list.
