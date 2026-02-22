import os
from typing import List
from groq import Groq
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from dotenv import load_dotenv
import PyPDF2
import docx

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# Initialize embedding model
# We'll use a lightweight model suitable for CPU
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

class RAGManager:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.index_path = f"indices/user_{user_id}.index"
        self.docs_metadata_path = f"indices/user_{user_id}_metadata.npy"
        self.dimension = 384 # For all-MiniLM-L6-v2
        
        if not os.path.exists("indices"):
            os.makedirs("indices")
            
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
            self.metadata = np.load(self.docs_metadata_path, allow_pickle=True).tolist()
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []

    def extract_text(self, file_path: str):
        extension = os.path.splitext(file_path)[1].lower()
        text = ""
        if extension == '.pdf':
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + " "
        elif extension == '.docx':
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + " "
        elif extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        return text

    def chunk_text(self, text: str, chunk_size=500, overlap=50):
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
        return chunks

    def add_document(self, file_path: str, file_name: str):
        text = self.extract_text(file_path)
        chunks = self.chunk_text(text)
        
        if not chunks:
            return
            
        embeddings = embedding_model.encode(chunks)
        self.index.add(np.array(embeddings).astype('float32'))
        
        for chunk in chunks:
            self.metadata.append({"file_name": file_name, "content": chunk})
            
        faiss.write_index(self.index, self.index_path)
        np.save(self.docs_metadata_path, self.metadata)

    def search(self, query: str, top_k=3):
        if self.index.ntotal == 0:
            return []
            
        query_embedding = embedding_model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype('float32'), top_k)
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self.metadata):
                results.append(self.metadata[idx])
        return results

    def generate_response(self, query: str, chat_history: List[dict] = []):
        context_docs = self.search(query)
        context_text = "\n\n".join([doc['content'] for doc in context_docs])
        
        messages = [
            {"role": "system", "content": f"You are ResearchHUB AI, an expert research assistant. Use the following context to answer the user's question. If the answer is not in the context, say you don't know based on the documents, but try to be as helpful as possible.\n\nContext:\n{context_text}"}
        ]
        
        for msg in chat_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": query})
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
            stream=True
        )
        
        return completion
