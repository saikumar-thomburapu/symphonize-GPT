
# 🎯 Symphonize AI Chat - Technical Documentation

A full-stack AI chat application with multi-model support, real-time streaming, voice input, file processing (images/PDFs/DOCX), and conversation management.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20Models-blue)](https://ollama.ai/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

---

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [System Workflow](#system-workflow)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Backend Services](#backend-services)
- [Database Schema](#database-schema)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## 🏗️ Architecture Overview

```

┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (Port 3000)                            │  │
│  │  - React Components                                       │  │
│  │  - State Management                                       │  │
│  │  - API Client (fetch/axios)                              │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
│ HTTP/REST API
│ (JSON + FormData)
┌────────────────────────┼────────────────────────────────────────┐
│  FastAPI Backend (Port 8000)                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Endpoints (/auth, /chat, /conversations)            │  │
│  │  ├─ CORS Middleware                                      │  │
│  │  ├─ JWT Authentication                                    │  │
│  │  └─ File Processing Service                              │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
│
┌────────────────┼────────────────┐
│                │                │
▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │    Ollama    │  │   Storage    │
│   Database   │  │  AI Models   │  │   (Local)    │
│              │  │              │  │              │
│ - Users      │  │ - Qwen3 VL   │  │ - Images     │
│ - Convos     │  │ - DeepSeek   │  │ - Files      │
│ - Messages   │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

```

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0 | React framework with SSR |
| **React** | 18.2 | UI component library |
| **TailwindCSS** | 3.3 | Utility-first CSS |
| **Lucide Icons** | Latest | Icon library |
| **React Markdown** | 8.0 | Markdown rendering |
| **Prism** | 1.29 | Code syntax highlighting |
| **jsPDF** | 2.5 | PDF generation |
| **docx** | 8.5 | DOCX export |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104 | Web framework |
| **Python** | 3.10+ | Programming language |
| **Uvicorn** | 0.24 | ASGI server |
| **httpx** | 0.25 | Async HTTP client |
| **PyPDF2** | 3.0 | PDF text extraction |
| **python-docx** | 1.1 | DOCX processing |
| **Pillow** | 10.1 | Image processing |
| **python-jose** | 3.3 | JWT tokens |
| **passlib** | 1.7 | Password hashing |

### **AI Models**
| Model | Size | Purpose |
|-------|------|---------|
| **Qwen3 VL 8B** | 6.14 GB | Vision + Text chat |
| **DeepSeek v2 16B** | 8.9 GB | Advanced reasoning |

### **Database & Storage**
| Service | Purpose |
|---------|---------|
| **Supabase PostgreSQL** | User data, conversations, messages |
| **Local Storage** | Temporary file processing |

---

## 🔄 System Workflow

### **1. User Authentication Flow**

```

sequenceDiagram
participant User
participant Frontend
participant FastAPI
participant Supabase

    User->>Frontend: Enter email/password
    Frontend->>FastAPI: POST /auth/signup or /auth/login
    FastAPI->>Supabase: Check user credentials
    Supabase-->>FastAPI: User data
    FastAPI->>FastAPI: Generate JWT token
    FastAPI-->>Frontend: {access_token, user}
    Frontend->>Frontend: Store token in localStorage
    Frontend-->>User: Redirect to chat
    ```

**API Call:**
```

POST /auth/login
Headers: { "Content-Type": "application/json" }
Body: { "email": "user@example.com", "password": "***" }
Response: { "access_token": "eyJ...", "user": {...} }

```

---

### **2. Chat Message Flow**

```

sequenceDiagram
participant User
participant Frontend
participant FastAPI
participant Ollama
participant Supabase

    User->>Frontend: Type message + attach files
    Frontend->>FastAPI: POST /chat/stream (FormData)
    FastAPI->>FastAPI: Process files (extract text/convert images)
    FastAPI->>Supabase: Save user message
    FastAPI->>Supabase: Get conversation history
    FastAPI->>FastAPI: Prepare context (system prompt + history)
    FastAPI->>Ollama: POST /api/chat (streaming)
    loop Streaming Response
        Ollama-->>FastAPI: Token chunks
        FastAPI-->>Frontend: SSE: data: {"content": "chunk"}
    end
    FastAPI->>Supabase: Save AI response
    FastAPI-->>Frontend: SSE: data: {"done": true}
    Frontend-->>User: Display full response
    ```

**API Call Timeline:**

1. **Frontend → Backend** (t=0ms)
```

POST /chat/stream
Headers: { "Authorization": "Bearer token" }
Body: FormData {
conversation_id: "uuid",
message: "What's in this image?",
model: "qwen3-vl:8b",
files: [File object]
}

```

2. **Backend → File Processing** (t=50ms)
```


# backend/app/services/file_service.py

- Validate file (size, type)
- Extract text (PDF/DOCX) OR
- Convert image to base64 (for vision models)

```

3. **Backend → Database** (t=100ms)
```


# Save user message to Supabase

INSERT INTO messages (conversation_id, role, content)

```

4. **Backend → AI Model** (t=150ms)
```


# backend/app/services/ollama_service.py

POST http://192.168.200.161:11434/api/chat
{
"model": "qwen3-vl:8b",
"messages": [
{"role": "system", "content": "You are an AI assistant..."},
{"role": "user", "content": "What's in this image?",
"images": ["base64_encoded_image"]}
],
"stream": true
}

```

5. **Streaming Response** (t=200ms - 5000ms)
```

Frontend receives: data: {"content": "The"}
Frontend receives: data: {"content": " image"}
Frontend receives: data: {"content": " shows"}
...
Frontend receives: data: {"done": true}

```

6. **Backend → Database** (t=5100ms)
```


# Save AI response

INSERT INTO messages (conversation_id, role, content, model)

```

---

### **3. File Processing Flow**

#### **Image Processing (Qwen3 Vision)**
```


# backend/app/services/file_service.py

async def convert_image_to_base64(file_content: bytes, filename: str):
\# 1. Validate image with PIL
img = Image.open(io.BytesIO(file_content))

    # 2. Check size constraints
    width, height = img.size
    if width < 50 or height < 50:
        raise Exception("Image too small")
    
    # 3. Resize if needed
    if width > 4000 or height > 4000:
        img.thumbnail((4000, 4000))
    
    # 4. Convert to RGB
    if img.mode not in ['RGB', 'RGBA']:
        img = img.convert('RGB')
    
    # 5. Encode to JPEG
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG', quality=95)
    
    # 6. Convert to base64
    base64_data = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    return {
        'type': 'image',
        'media_type': 'image/jpeg',
        'data': base64_data
    }
    ```

#### **PDF Text Extraction**
```

async def extract_text_from_pdf(file_content: bytes):
pdf_file = io.BytesIO(file_content)
pdf_reader = PyPDF2.PdfReader(pdf_file)

    text = ""
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text += f"\n--- Page {page_num + 1} ---\n"
        text += page.extract_text()
    
    return text.strip()
    ```

#### **DOCX Text Extraction**
```

async def extract_text_from_docx(file_content: bytes):
docx_file = io.BytesIO(file_content)
doc = Document(docx_file)

    text = ""
    for para in doc.paragraphs:
        if para.text.strip():
            text += para.text + "\n"
    
    return text.strip()
    ```

---

## 🔌 API Endpoints

### **Authentication (`/auth`)**

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/auth/signup` | POST | Create new account | `{email, password}` | `{access_token, user}` |
| `/auth/login` | POST | User login | `{email, password}` | `{access_token, user}` |
| `/auth/logout` | POST | User logout | - | `{message}` |
| `/auth/me` | GET | Get current user | - | `{user}` |

### **Conversations (`/conversations`)**

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/conversations/` | GET | List all conversations | `[{id, title, created_at, message_count}]` |
| `/conversations/` | POST | Create conversation | `{id, title, created_at}` |
| `/conversations/{id}` | GET | Get conversation details | `{id, title, messages: [...]}` |
| `/conversations/{id}` | PATCH | Update conversation title | `{id, title}` |
| `/conversations/{id}` | DELETE | Delete conversation | `204 No Content` |

### **Chat (`/chat`)**

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/chat/models` | GET | Get available models | - | `{models: [{id, name}], default}` |
| `/chat/stream` | POST | Send message (streaming) | FormData | Server-Sent Events (SSE) |
| `/chat/history/{id}` | GET | Get conversation history | - | `{messages: [...]}` |

---

## 🎨 Frontend Components

### **Component Hierarchy**
```

app/
├── layout.js                    \# Root layout with providers
├── page.js                      \# Landing page
├── login/page.js                \# Login page
├── signup/page.js               \# Signup page
└── chat/
└── page.js                  \# Main chat interface

components/
├── layout/
│   ├── Header.jsx               \# Top navbar with user menu
│   └── Sidebar.jsx              \# Conversation list sidebar
├── chat/
│   ├── ChatInterface.jsx        \# Main chat container
│   ├── ChatMessage.jsx          \# Individual message bubble
│   ├── ChatInput.jsx            \# Message input with file upload
│   └── TypingIndicator.jsx     \# Loading animation
└── auth/
└── ProtectedRoute.jsx       \# Auth guard component

lib/
├── api.js                       \# API client functions
└── utils.js                     \# Helper functions

```

### **Key Component Functions**

#### **ChatInterface.jsx**
```

// Main responsibilities:

- Load conversation history on mount
- Manage message state (messages, streaming)
- Handle file uploads
- Stream AI responses
- Auto-scroll to bottom

// API Calls:
useEffect(() => {
loadMessages()      // GET /chat/history/{id}
loadModels()        // GET /chat/models
}, [conversationId])

handleSend()          // POST /chat/stream

```

#### **ChatMessage.jsx**
```

// Displays individual messages with:

- User/AI avatar
- Timestamp
- Message content (Markdown support)
- Code syntax highlighting
- Share/Export buttons (AI messages only)

// Export functions:
handleExportPDF()     // Generate PDF with jsPDF
handleExportDOCX()    // Generate DOCX with docx
handleExportMarkdown()// Download .md file
handleShare()         // Copy to clipboard

```

#### **ChatInput.jsx**
```

// Features:

- Textarea with auto-resize
- Model selector dropdown
- File upload (PDF, DOCX, TXT, Images)
- Voice input (Web Speech API)
- Send button

// API Call:
onSend(message, files) → POST /chat/stream (FormData)

```

---

## ⚙️ Backend Services

### **Service Layer Architecture**
```

backend/app/
├── main.py                      \# FastAPI app entry point
├── core/
│   └── config.py                \# Environment configuration
├── api/
│   ├── auth.py                  \# Authentication endpoints
│   ├── chat.py                  \# Chat endpoints
│   └── conversations.py         \# Conversation CRUD
├── services/
│   ├── supabase_service.py      \# Database operations
│   ├── ollama_service.py        \# Ollama AI integration
│   ├── file_service.py          \# File processing
│   └── deepseek_service.py      \# DeepSeek model (optional)
├── models/
│   ├── user.py                  \# Pydantic user models
│   ├── conversation.py          \# Conversation models
│   └── chat.py                  \# Chat request/response models
└── utils/
├── context_manager.py       \# Conversation context builder
├── security.py              \# JWT \& password hashing
└── data_cleanup.py          \# Scheduled cleanup tasks

```

### **Supabase Service (`supabase_service.py`)**

**Key Functions:**
```


# User Management

async def get_user_by_email(email: str) → dict
async def create_user(email: str, hashed_password: str) → dict

# Conversation Management

async def create_conversation(user_id: str, title: str) → dict
async def get_conversations(user_id: str) → List[dict]
async def delete_conversation(conversation_id: str, user_id: str) → bool

# Message Management

async def save_message(conversation_id: str, role: str, content: str, model: str) → dict
async def get_conversation_messages(conversation_id: str) → List[dict]

```

**Database Queries:**
```


# Example: Save message

supabase.table("messages").insert({
"conversation_id": conversation_id,
"role": role,
"content": content,
"model": model,
"created_at": datetime.utcnow().isoformat()
}).execute()

```

### **Ollama Service (`ollama_service.py`)**

**Streaming Response:**
```

async def generate_response_stream(
messages: List[Dict],
model_name: str = "qwen3-vl:8b"
) -> AsyncGenerator[str, None]:

    # Format messages + extract images
    formatted_messages, images_by_message = self._format_messages_for_ollama(messages)
    
    # Prepare payload
    payload = {
        "model": model_name,
        "messages": formatted_messages,
        "stream": True
    }
    
    # Add images to last message
    if images_by_message:
        last_idx = len(formatted_messages) - 1
        if last_idx in images_by_message:
            payload["messages"][last_idx]["images"] = [
                img["data"] for img in images_by_message[last_idx]
            ]
    
    # Stream response
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
            async for line in response.aiter_lines():
                chunk = json.loads(line)
                if chunk.get("done"):
                    break
                content = chunk.get("message", {}).get("content", "")
                if content:
                    yield content
    ```

### **Context Manager (`context_manager.py`)**

**Building Conversation Context:**
```

def prepare_context(messages: List[Dict], system_prompt: str) → List[Dict]:
context = [{"role": "system", "content": system_prompt}]

    for msg in messages:
        context.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    return context
    ```

---

## 🗄️ Database Schema

### **Supabase Tables**

#### **users**
```

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
email VARCHAR(255) UNIQUE NOT NULL,
hashed_password VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

```

#### **conversations**
```

CREATE TABLE conversations (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
title VARCHAR(500) DEFAULT 'New Conversation',
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

```

#### **messages**
```

CREATE TABLE messages (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
content TEXT NOT NULL,
model VARCHAR(100),          -- AI model name
created_at TIMESTAMP DEFAULT NOW()
);

```

**Indexes:**
```

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

```

---

## 📥 Installation Guide

### **Prerequisites**
- Node.js 18+
- Python 3.10+
- Ollama (with models downloaded)
- Supabase account

### **1. Clone Repository**
```

git clone https://github.com/yourusername/symphonize-ai-chat.git
cd symphonize-ai-chat

```

### **2. Backend Setup**
```

cd backend

# Create virtual environment

python -m venv venv
source venv/bin/activate  \# On Windows: venv\Scripts\activate

# Install dependencies

pip install -r requirements.txt

# Create .env file

cp .env.example .env

# Edit .env with your configuration

# Run backend

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```

**Backend `.env`:**
```

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SECRET_KEY=your_secret_key_here
OLLAMA_BASE_URL=http://192.168.200.161:11434
FRONTEND_URL=http://localhost:3000

```

### **3. Frontend Setup**
```

cd frontend

# Install dependencies

npm install

# Install export libraries

npm install jspdf html2canvas docx

# Create .env.local

cp .env.example .env.local

# Edit with backend URL

# Run frontend

npm run dev

```

**Frontend `.env.local`:**
```

NEXT_PUBLIC_API_URL=http://localhost:8000

```

### **4. Download Ollama Models**
```

ollama pull qwen3-vl:8b
ollama pull deepseek-v2:16b

```

---

## 🚀 Deployment

### **Backend (FastAPI)**

**Option 1: Docker**
```

FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

```

**Option 2: systemd Service**
```

[Unit]
Description=Symphonize AI Chat Backend
After=network.target

[Service]
User=your_user
WorkingDirectory=/path/to/backend
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target

```

### **Frontend (Next.js)**

**Option 1: Vercel** (Recommended)
```

npm run build
vercel deploy

```

**Option 2: Docker**
```

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]

```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| **Message Response Time** | 200ms - 5000ms (depends on model) |
| **File Processing** | < 2s for images, < 5s for PDFs |
| **Database Query Time** | < 50ms average |
| **Memory Usage (Backend)** | ~150MB idle, ~500MB active |
| **Memory Usage (Ollama Qwen3)** | ~6GB VRAM |
| **Concurrent Users** | 50+ (with load balancing) |

---

## 🔒 Security Features

- ✅ JWT authentication with 24h expiration
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation (Pydantic models)
- ✅ File size & type restrictions
- ✅ SQL injection protection (Supabase parameterized queries)
- ✅ XSS protection (React automatic escaping)

 
---

## 🐛 Known Issues

1. **Empty AI responses for some images** - Check image format/size
2. **CORS errors on first deployment** - Add frontend URL to CORS origins
3. **Ollama timeout on large files** - Increase timeout in `ollama_service.py`

---

 
