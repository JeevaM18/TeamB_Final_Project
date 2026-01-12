# New React UI Setup

This project now includes a modern React-based frontend for the NLU Engine.

## Structure
- `frontend/`: The React application (Vite).
- `server.py`: The FastAPI backend serving the NLU models.
- `app.py`: The legacy Streamlit application.

## How to Run

1. **Start the Backend**
   Open a terminal in the root directory and run:
   ```bash
   python -m uvicorn server:app --reload --port 8000
   ```

2. **Start the Frontend**
   Open a new terminal, navigate to `frontend`, and run:
   ```bash
   cd frontend
   npm run dev
   ```
   Access the UI at: `http://localhost:5173`

## Configuration
- The frontend connects to `http://localhost:8000`.
- Requires `config/config.yaml` to be present (uses same config as Streamlit app).
