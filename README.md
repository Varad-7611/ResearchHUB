# ResearchHUB AI 🚀

A production-ready **Agentic AI-powered research assistant** that helps users search, analyze, and interact with research papers intelligently.

ResearchHUB AI allows users to:

- Upload research papers
- Ask questions from documents
- Perform intelligent web searches
- Chat with an AI research assistant

The system uses **Retrieval-Augmented Generation (RAG)** with vector embeddings to generate accurate and contextual responses.

---

# ✨ Features

## 🔐 Authentication
- Secure **JWT-based authentication**
- **OTP email verification**
- Password hashing using **bcrypt**
- Protected API routes

---

## 📄 Research Paper Upload

Users can upload research papers in the following formats:

- PDF
- DOCX
- TXT

When a document is uploaded:

1. The document is parsed.
2. Text is split into chunks.
3. Embeddings are generated using **Sentence Transformers**.
4. Stored in a **FAISS vector database**.
5. Used for **RAG-based retrieval**.

This allows the AI to answer questions directly from the uploaded document.

---

## 🤖 AI Research Chat

- ChatGPT-style conversational interface
- Streaming AI responses
- Context-aware answers
- Powered by **Llama-3.3-70B via Groq API**

---

## 🔎 Web Search Capability

Users can instruct the AI to perform a web search.

### Prompt Format

```
Search on web and give me: <Your Question>
```

### Example

```
Search on web and give me: Latest advancements in quantum computing
```

The AI retrieves relevant web information and summarizes it for the user.

---

## 📚 Ask Questions from Uploaded Documents

Users can ask questions directly from uploaded research papers.

### Prompt Format

```
I uploaded a research document <document_name> + <your question>
```

### Example

```
I uploaded a research document transformer_research.pdf + What problem does this paper solve?
```

The system will:

1. Retrieve relevant document chunks
2. Send them to the LLM
3. Generate a contextual answer.

---

# 🧠 Agentic AI System

ResearchHUB uses an **Agentic AI architecture** that decides how to answer user queries.

The AI agent dynamically selects between:

- Document retrieval (RAG)
- Web search
- Direct LLM reasoning

This makes the assistant **task-aware and intelligent**.

---

# 🎨 Premium Animated UI

The platform includes a modern **SaaS-style interface** with:

- Dark themed UI
- Glassmorphism design
- Smooth animations using **Framer Motion**
- Responsive chat interface
- Clean user dashboard

---

# ⚡ Scalable Architecture

Built for performance and scalability using modern technologies.

- FastAPI backend
- React + Vite frontend
- FAISS vector database
- Efficient embedding models
- Cloud deployment on AWS

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

---

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- FAISS Vector Search

---

## AI & Machine Learning

- Llama-3.3-70B (Groq API)
- Sentence Transformers
- Retrieval-Augmented Generation (RAG)

---

## Cloud & Deployment

- AWS EC2
- Ubuntu Linux
- Nginx
- Gunicorn
- Node.js
- Python

---

# 🧠 System Architecture

```
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├── Authentication (JWT)
 │
 ├── Document Processing
 │     ├── PDF Parsing
 │     ├── Text Chunking
 │     ├── Embedding Generation
 │     └── FAISS Vector Store
 │
 ├── Agentic AI Decision Layer
 │     ├── Document RAG
 │     ├── Web Search
 │     └── Direct LLM Response
 │
 ▼
Groq API (Llama-3.3-70B)
```

---

# 📁 Folder Structure

```
research-hub/
│
├── backend/                # FastAPI Backend
│   │
│   ├── uploads/            # Uploaded research documents
│   ├── indices/            # FAISS vector storage
│   ├── rag.py              # RAG pipeline
│   ├── auth.py             # Authentication logic
│   ├── models.py           # Database models
│   ├── main.py             # FastAPI entry point
│   ├── requirements.txt
│   └── .env                # Environment variables
│
├── frontend/               # React Frontend
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/research-hub.git

cd research-hub
```

---

# ⚙ Backend Setup

Navigate to backend folder

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate environment

Linux / Mac

```bash
source venv/bin/activate
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run the backend server

```bash
uvicorn main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

# ⚙ Frontend Setup

Navigate to frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 🔐 Environment Variables

Create a `.env` file inside **backend/**

```
GROQ_API_KEY=your_groq_api_key

JWT_SECRET_KEY=your_secret_key

EMAIL_USER=your_email

EMAIL_PASSWORD=your_email_password
```

---

# ☁ Deployment

The application is hosted on **AWS Cloud**.

Production stack includes:

- AWS EC2
- Ubuntu Linux
- Nginx reverse proxy
- Gunicorn for FastAPI
- Node.js for frontend build
- Python backend services

---

# 🔒 Security

- JWT protected API routes
- Bcrypt password hashing
- Secure document storage
- User-level document isolation
- Environment variable protection

---

# 📌 Future Improvements

- Multi-document RAG
- Automatic research paper summarization
- Citation extraction
- Research paper recommendation system
- Knowledge graph generation
- Multi-agent research workflows

---

# 👨‍💻 Authors

Built with ❤️ by **ResearchHUB AI Team**

---
