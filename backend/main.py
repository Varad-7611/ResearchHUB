from fastapi import (
    FastAPI, Depends, HTTPException, status,
    UploadFile, File, Form
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os
import datetime
from jose import JWTError, jwt

import schemas
import auth
import email_utils
import rag
import models
from database import engine, get_db

# ======================================================
# APP INITIALIZATION
# ======================================================

app = FastAPI(title="ResearchHUB AI API")

# ======================================================
# CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
UPLOAD_DIR = "uploads"

# ======================================================
# STARTUP EVENT (CRITICAL FOR RENDER)
# ======================================================

@app.on_event("startup")
def startup():
    print("✅ FastAPI startup started")

    # Ensure upload directory
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Create DB tables AFTER server boots
    models.Base.metadata.create_all(bind=engine)

    print("✅ Database & folders initialized")

# ======================================================
# HEALTH CHECK (RENDER NEEDS THIS)
# ======================================================

@app.get("/")
def root():
    return {"status": "ok"}

# ======================================================
# AUTH DEPENDENCY
# ======================================================

async def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
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
    if not user or not user.is_verified:
        raise credentials_exception

    return user

# ======================================================
# AUTH ROUTES
# ======================================================

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    otp_code = auth.generate_otp()
    otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    db.add(models.OTP(
        user_id=new_user.id,
        otp_code=otp_code,
        otp_expiry=otp_expiry
    ))
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
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")

    token = auth.create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": user.name, "email": user.email}
    }

# ======================================================
# DASHBOARD
# ======================================================

@app.get("/dashboard-stats")
def dashboard_stats(
    user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    docs = db.query(models.Document).filter(models.Document.user_id == user.id).count()
    chats = db.query(models.Chat).filter(models.Chat.user_id == user.id).count()
    messages = db.query(models.Message).join(models.Chat).filter(
        models.Chat.user_id == user.id
    ).count()

    return {
        "user_name": user.name,
        "total_documents": docs,
        "total_chats": chats,
        "total_messages": messages,
    }

# ======================================================
# DOCUMENT UPLOAD
# ======================================================

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_dir = os.path.join(UPLOAD_DIR, str(user.id))
    os.makedirs(user_dir, exist_ok=True)

    file_path = os.path.join(user_dir, file.filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = models.Document(
        user_id=user.id,
        file_name=file.filename,
        file_path=file_path
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    rag_manager = rag.RAGManager(user.id)
    rag_manager.add_document(file_path, file.filename)

    return doc

# ======================================================
# CHAT + RAG STREAM
# ======================================================

@app.post("/chats/{chat_id}/query")
async def chat_query(
    chat_id: int,
    query: str = Form(...),
    user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    chat = db.query(models.Chat).filter(
        models.Chat.id == chat_id,
        models.Chat.user_id == user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.add(models.Message(chat_id=chat_id, sender="user", content=query))
    db.commit()

    rag_manager = rag.RAGManager(user.id)
    stream = rag_manager.generate_response(query, [])

    async def event_generator():
        response = ""
        for chunk in stream:
            response += chunk
            yield chunk

        db.add(models.Message(
            chat_id=chat_id,
            sender="bot",
            content=response
        ))
        db.commit()

    return StreamingResponse(event_generator(), media_type="text/plain")

# ======================================================
# LOCAL RUN (IGNORED BY RENDER)
# ======================================================
