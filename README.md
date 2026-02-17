# Smart Blog Editor

A production-ready blog editor building with **React (Vite)**, **FastAPI**, **MongoDB**, and **Lexical Editor**.
Features real-time auto-save, rich text editing, and GenAI streaming integration.

## Architecture

```mermaid
graph TD
    User[User] -->|Interacts| Frontend[React + Lexical]
    Frontend -->|Auto-Save (Debounced)| API[FastAPI]
    Frontend -->|Stream Request| AI_API[AI Route]
    API -->|Store JSON| DB[(MongoDB)]
    AI_API -->|Stream| Gemini[Gemini API]
```

## Tech Stack
- **Frontend**: React, Zustand, Lexical, Tailwind CSS
- **Backend**: FastAPI, Motor (Async MongoDB), Uvicorn
- **Database**: MongoDB (Stores Lexical JSON directly)
- **AI**: Google Gemini (Streaming)

## Project Structure
```
/backend
    /models      # DB Models
    /routes      # API Routes
    main.py      # App Entry
    database.py  # DB Connection
/frontend
    /src
        /components/Editor  # Lexical Implementation
        /store              # Zustand State
        /hooks              # Auto-save Logic
        /pages              # Application Pages
```

## Getting Started

1.  **Backend**:
    ```bash
    cd backend
    pip install -r requirements.txt
    python -m uvicorn main:app --reload
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Features implemented
- [x] **Modular Architecture**: Clean separation of concerns.
- [x] **Rich Text Editor**: Lexical-based block editor.
- [x] **Auto-Save**: Custom hook with debounce logic.
- [x] **State Management**: Zustand for global state.
- [x] **AI Streaming**: Real-time text generation.
