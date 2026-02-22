from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_verified: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    file_name: str
    uploaded_at: datetime.datetime

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    content: str
    sender: str

class MessageResponse(MessageBase):
    id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class ChatBase(BaseModel):
    chat_title: str

class ChatCreate(ChatBase):
    pass

class ChatResponse(ChatBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ChatDetail(ChatResponse):
    messages: List[MessageResponse] = []
