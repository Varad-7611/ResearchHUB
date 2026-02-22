# ResearchHUB AI 🚀

A production-ready, fully animated SaaS web application for agentic AI research assistance. Search, upload, analyze, and chat with research papers intelligently.

## ✨ Features

- **Auth**: Secure JWT authentication with OTP-based email verification.
- **RAG System**: Document processing (PDF, DOCX, TXT) with FAISS vector search.
- **AI Chat**: ChatGPT-style interface with streaming responses using Llama-3.3-70B.
- **Animated UI**: Premium dark-themed SaaS UI with glassmorphism and Framer Motion.
- **Scalable**: Built with FastAPI and React for high performance.

## 🛠 Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: FastAPI, SQLAlchemy, SQLite, Groq SDK, Sentence Transformers, FAISS.
- **AI**: Llama-3.3-70B via Groq API.

## 🚀 Getting Started

Check the [SETUP.md](./SETUP.md) for detailed instructions on how to set up the environment and run the application.

## 📁 Folder Structure

```
research-hub/
├── backend/            # FastAPI Backend
│   ├── uploads/        # User uploaded documents
│   ├── indices/        # FAISS vector storage
│   ├── requirements.txt
│   └── .env            # Environment variables
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
└── README.md
```

## 🔐 Security

- JWT protected routes.
- Secure password hashing with bcrypt.
- Isolated user data storage.
- Document-level RAG permissions.

---
Built with ❤️ by ResearchHUB AI Team.
