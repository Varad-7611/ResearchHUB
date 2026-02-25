import os
from typing import List
from dotenv import load_dotenv
import PyPDF2
import docx
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from duckduckgo_search import DDGS

load_dotenv()

HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

from huggingface_hub import InferenceClient
client = InferenceClient(api_key=HUGGINGFACEHUB_API_TOKEN)
DEFAULT_MODEL = "meta-llama/Llama-3.3-70B-Instruct"
print(f"Using Hugging Face Inference Client with model {DEFAULT_MODEL}")

# Initialize embedding model
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

    def delete_document(self, file_name: str):
        # Filter out the deleted document from metadata
        new_metadata = [item for item in self.metadata if item['file_name'] != file_name]
        
        if len(new_metadata) == len(self.metadata):
            return # Document not found
            
        self.metadata = new_metadata
        
        # Rebuild the index from scratch
        self.index = faiss.IndexFlatL2(self.dimension)
        if self.metadata:
            chunks = [item['content'] for item in self.metadata]
            embeddings = embedding_model.encode(chunks)
            self.index.add(np.array(embeddings).astype('float32'))
            
        faiss.write_index(self.index, self.index_path)
        np.save(self.docs_metadata_path, self.metadata)

    def search_web(self, query: str):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=3))
                web_text = "\n".join([f"Source: {r['href']}\nContent: {r['body']}" for r in results])
                return web_text
        except Exception as e:
            print(f"Web search error: {e}")
            return ""

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
        try:
            # Check if user has ANY documents uploaded
            has_documents = self.index.ntotal > 0
            context_docs = self.search(query) if has_documents else []
            
            # User data isolation - ensured by self.user_id in index path
            print(f"DEBUG: Processing query for User ID: {self.user_id}")
            
            filenames = []
            if context_docs:
                context_text = "\n\n".join([doc['content'] for doc in context_docs])
                filenames = list(set([doc['file_name'] for doc in context_docs]))
                source_info = f"Uploaded Documents ({', '.join(filenames)})"
            else:
                context_text = ""
                source_info = ""

            # Check if the previous message was a quest for web search permission
            last_bot_msg = next((msg["content"] for msg in reversed(chat_history) if msg["role"] == "assistant"), "")
            permission_asked = "Should I search the web for you? (Yes/No)" in last_bot_msg
            user_said_yes = any(word in query.lower() for word in ["yes", "yup", "yeah", "ok", "sure"])
            
            is_web_search_required = False
            web_context = ""

            # Check if this is a follow-up "Yes" to a web search request
            if permission_asked and user_said_yes:
                # Find the actual question from history
                actual_query = ""
                for msg in reversed(chat_history):
                    if msg["role"] == "user" and "yes" not in msg["content"].lower():
                        actual_query = msg["content"]
                        break
                
                if not actual_query:
                    actual_query = query # Fallback

                print(f"User confirmed web search for: {actual_query}")
                web_context = self.search_web(actual_query)
                source_info = "Web Search"
                is_web_search_required = True
                context_text = web_context
            elif not context_docs:
                small_talk_keywords = ["hello", "hi", "hey", "who are you", "what can you do", "thanks", "thank you", "how are you"]
                if any(kw in query.lower() for kw in small_talk_keywords) and len(query.split()) < 6:
                    source_info = "General Conversation"
                else:
                    def ask_permission_generator():
                        yield "This information is not mentioned in your documents. Should I search the web for you? (Yes/No)"
                    return ask_permission_generator()

            system_prompt = f"""You are ResearchHUB AI, an expert research assistant.
            
            Strict Guidelines:
            1. Response Style: Professional, concise, and synthesized.
            2. SYNTHESIZE: When using web results, read all the information and provide a single, well-structured answer in your own words.
            3. Formatting: Use Markdown for readability.
            4. Source Transparency & Privacy: 
               - You ONLY have access to documents uploaded by User ID {self.user_id}.
            
            Context Availability: {"Available" if context_text else "None (General Conversation)"}
            
            Instructions:
            - If using documents, start with: "Based on the documents you uploaded ({', '.join(filenames) if filenames else 'N/A'}), I found this:" and then provide the answer. Do NOT include any URLs or links.
            - If using web search, start with: "[Source: Web Search]" and provide a synthesized answer. Only include reference links at the very bottom if absolutely necessary.
            - If it's a general greeting or casual question, just be friendly and helpful. Do NOT include any URLs or links.
            - IMPORTANT: Do NOT add random links or URLs unless the information actually came from the web search. Never fabricate or guess URLs.
            
            Current Context:
            {context_text if context_text else "No research context available."}
            """

            messages = [{"role": "system", "content": system_prompt}]
            for msg in chat_history:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": query})
            
            completion = client.chat_completion(
                model=DEFAULT_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
                stream=True
            )
            return completion
        except Exception as e:
            error_msg = str(e)
            print(f"Error in generate_response: {error_msg}")
            def error_generator():
                yield f"I'm sorry, I encountered an error while processing your request: {error_msg}"
            return error_generator()
