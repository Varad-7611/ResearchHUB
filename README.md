# ResearchHUB AI 🚀

A production-ready **Agentic AI-powered research assistant** that helps users **upload, analyze, search, and interact with research papers intelligently**.

ResearchHUB AI allows users to:

- Upload research papers
- Analyze research documents automatically
- Ask questions about uploaded documents
- Perform intelligent web searches
- Chat with an AI research assistant

The system uses **Retrieval-Augmented Generation (RAG)** with vector embeddings to generate accurate, contextual, and research-focused responses.

---

# ✨ Features

## 🔐 Authentication

- Secure **JWT-based authentication**
- **OTP email verification**
- Password hashing using **bcrypt**
- Protected API routes

---

# 📄 Research Paper Upload

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

This allows the AI to answer questions directly from the uploaded research paper.

---

# 🔬 Research Paper Analysis

ResearchHUB AI can **analyze research papers automatically**.

After uploading a document, the AI can:

- Understand the **research problem**
- Extract **key concepts**
- Identify **methods and techniques used**
- Summarize the **results and conclusions**
- Answer **complex questions about the paper**

The system retrieves the most relevant sections of the paper and uses **LLM reasoning** to generate accurate answers.

Example questions you can ask:

```
I uploaded a research document transformer_research.pdf + What problem does this paper solve?
```

```
I uploaded a research document transformer_research.pdf + Explain the proposed methodology.
```

```
I uploaded a research document transformer_research.pdf + What are the key results of the paper?
```

---

# 🤖 AI Research Chat

- ChatGPT-style conversational interface
- Streaming AI responses
- Context-aware answers
- Powered by **Llama-3.3-70B via Groq API**

The assistant helps researchers understand papers quickly.

---

# 🔎 Web Search Capability

Users can instruct the AI to perform a web search.

### Prompt Format

```
Search on web and give me: <Your Question>
```

### Example

```
Search on web and give me: Latest advancements in quantum computing
```

The AI retrieves and summarizes relevant information from the web.

---

# 📚 Ask Questions from Uploaded Documents

Users can ask questions directly from uploaded research papers.

### Prompt Format

```
I uploaded a research document <document_name> + <your question>
```

### Example

```
I uploaded a research document attention_is_all_you_need.pdf + What is the main contribution of this paper?
```

The system will:

1. Retrieve relevant document sections
2. Send them to the LLM
3. Generate a contextual answer

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

## Clone Repository

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

```
source venv/bin/activate
```

Windows

```
venv\Scripts\activate
```

Install dependencies

```
pip install -r requirements.txt
```

Run backend server

```
uvicorn main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

# ⚙ Frontend Setup

Navigate to frontend folder

```
cd frontend
```

Install dependencies

```
npm install
```

Run development server

```
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

The application is deployed on **AWS Cloud**.

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
