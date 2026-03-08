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

# 📸 Screenshots

## 🏠 Landing Page

<img width="1817" height="927" alt="image" src="https://github.com/user-attachments/assets/48a52dfa-37ee-4ac8-9b18-14c020fb6a41" />

---

## 🔐 Authentication (Login / Signup)

<img width="1816" height="866" alt="image" src="https://github.com/user-attachments/assets/0ab8d625-0aa0-473d-955c-ec7c8d420760" />

<img width="1667" height="875" alt="image" src="https://github.com/user-attachments/assets/95f0d7aa-ce22-4292-a49e-6d266c930614" />

<img width="1793" height="873" alt="image" src="https://github.com/user-attachments/assets/46c5eda0-19aa-481c-8ac2-b97294c18897" />


---
## Dashboard 

<img width="1910" height="926" alt="image" src="https://github.com/user-attachments/assets/2be0d5cf-e542-474f-b098-6e9f2cf60502" />


---
## 💬 AI Research Chat Interface

<img width="1879" height="903" alt="image" src="https://github.com/user-attachments/assets/1f822602-1616-44a7-aefc-8ec709bdfff8" />

---

## 📄 Research Paper Upload

<img width="1883" height="883" alt="image" src="https://github.com/user-attachments/assets/f8426fc8-65ce-4433-a220-c52755bb6f6e" />


---

## 🔬 Research Paper Analysis

<img width="1904" height="902" alt="image" src="https://github.com/user-attachments/assets/112b6402-94d5-4d6a-80e3-d7cf22e7c718" />


---

## 🔎 Web Search Feature

<img width="1880" height="920" alt="image" src="https://github.com/user-attachments/assets/77c1ced3-3a45-466c-aa39-ab73a7701576" />


---

# 🧠 System Architecture

<img width="1536" height="1024" alt="ChatGPT Image Mar 8, 2026, 10_36_09 AM" src="https://github.com/user-attachments/assets/2ed18be0-d338-4852-9768-fe28e320036a" />

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
# 

---

# 👨‍💻 Authors

Built with ❤️ by **ResearchHUB AI Team**

---
