from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import datetime
from jose import JWTError, jwt

import schemas, auth, email_utils, rag
import models
from database import engine, get_db


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResearchHUB AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")
    return user

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate and send OTP
    otp_code = auth.generate_otp()
    otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db_otp = models.OTP(user_id=new_user.id, otp_code=otp_code, otp_expiry=otp_expiry)
    db.add(db_otp)
    db.commit()
    
    email_utils.send_otp_email(new_user.email, otp_code)
    
    return new_user

@app.post("/verify-otp")
def verify_otp(data: schemas.OTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_otp = db.query(models.OTP).filter(
        models.OTP.user_id == user.id, 
        models.OTP.otp_code == data.otp_code,
        models.OTP.otp_expiry > datetime.datetime.utcnow()
    ).first()
    
    if not db_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user.is_verified = True
    db.delete(db_otp)
    db.commit()
    return {"message": "Email verified successfully"}

@app.post("/login")
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user.name, "email": user.email}}

@app.get("/dashboard-stats")
def get_stats(user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    docs_count = db.query(models.Document).filter(models.Document.user_id == user.id).count()
    chats_count = db.query(models.Chat).filter(models.Chat.user_id == user.id).count()
    messages_count = db.query(models.Message).join(models.Chat).filter(models.Chat.user_id == user.id).count()
    
    # Get query history for graph (last 7 days as example)
    from sqlalchemy import func
    import datetime
    
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    
    query_history = db.query(
        func.date(models.Message.timestamp).label('date'),
        func.count(models.Message.id).label('count')
    ).join(models.Chat).filter(
        models.Chat.user_id == user.id,
        models.Message.sender == 'user',
        models.Message.timestamp >= seven_days_ago
    ).group_by(
        func.date(models.Message.timestamp)
    ).order_by(
        func.date(models.Message.timestamp)
    ).all()
    
    history_data = [{"date": str(h.date), "count": h.count} for h in query_history]
    
    # Fill in zeros for days with no activity
    final_history = []
    for i in range(7, -1, -1):
        d = (datetime.datetime.utcnow() - datetime.timedelta(days=i)).date()
        date_str = str(d)
        count = next((h["count"] for h in history_data if h["date"] == date_str), 0)
        final_history.append({"date": d.strftime("%b %d"), "queries": count})

    return {
        "user_name": user.name,
        "total_documents": docs_count,
        "total_chats": chats_count,
        "total_messages": messages_count,
        "query_history": final_history
    }

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    user: models.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    # Set max file size to 200MB
    MAX_FILE_SIZE = 200 * 1024 * 1024 # 200MB
    
    # Read a chunk to check size (UploadFile.size is only available after read)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 200MB.")
    
    # Reset file pointer after reading content
    await file.seek(0)

    user_dir = os.path.join(UPLOAD_DIR, str(user.id))
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)
        
    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    db_doc = models.Document(user_id=user.id, file_name=file.filename, file_path=file_path)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Process RAG
    rag_manager = rag.RAGManager(user.id)
    rag_manager.add_document(file_path, file.filename)
    
    return db_doc

@app.get("/documents", response_model=List[schemas.DocumentResponse])
def get_documents(user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(models.Document).filter(models.Document.user_id == user.id).all()

@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int, user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id, models.Document.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    # Remove from RAG index
    rag_manager = rag.RAGManager(user.id)
    rag_manager.delete_document(doc.file_name)
    
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}

@app.post("/chats", response_model=schemas.ChatResponse)
def create_chat(chat: schemas.ChatCreate, user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    new_chat = models.Chat(user_id=user.id, chat_title=chat.chat_title)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@app.get("/chats", response_model=List[schemas.ChatResponse])
def get_chats(user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return db.query(models.Chat).filter(models.Chat.user_id == user.id).order_by(models.Chat.created_at.desc()).all()

@app.get("/chats/{chat_id}", response_model=schemas.ChatDetail)
def get_chat(chat_id: int, user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: int, user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully"}

from fastapi.responses import StreamingResponse

@app.post("/chats/{chat_id}/query")
async def chat_query(
    chat_id: int, 
    query: str = Form(...), 
    user: models.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Save user message
    user_msg = models.Message(chat_id=chat_id, sender="user", content=query)
    db.add(user_msg)
    db.commit()
    
    # Get chat history
    history = []
    messages = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.timestamp.asc()).all()
    for m in messages[:-1]: # exclude the current query
        role = "assistant" if m.sender == "bot" else "user"
        history.append({"role": role, "content": m.content})
        
    rag_manager = rag.RAGManager(user.id)
    stream = rag_manager.generate_response(query, history)
    
    async def event_generator():
        full_response = ""
        try:
            for chunk in stream:
                # Handle Groq stream objects
                if hasattr(chunk, 'choices'):
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        full_response += content
                        yield content
                # Handle error generator yielding strings
                elif isinstance(chunk, str):
                    full_response += chunk
                    yield chunk
        except Exception as e:
            error_msg = f"\n[Stream Error: {str(e)}]"
            full_response += error_msg
            yield error_msg
        
        # Save bot response after stream ends
        if full_response:
            bot_msg = models.Message(chat_id=chat_id, sender="bot", content=full_response)
            db.add(bot_msg)
            db.commit()

    return StreamingResponse(event_generator(), media_type="text/plain")


