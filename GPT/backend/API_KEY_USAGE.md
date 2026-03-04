# API Key Usage Guide

## Quick Start

### 1. Run the Database Migration

First, apply the database migration to add the `api_keys` table:

```sql
-- In Supabase SQL Editor, run:
-- File: GPT/database/migration_add_api_keys.sql
```

Or if setting up a new database, the schema.sql already includes the api_keys table.

### 2. Start the Backend

```bash
cd GPT/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Create an API Key

#### Option A: Via Swagger UI (Recommended for Testing)

1. Open http://localhost:8000/docs
2. Click "Authorize" button
3. Login with your credentials to get a JWT token
4. Navigate to `/api-keys/` POST endpoint
5. Click "Try it out"
6. Enter request body:
```json
{
  "key_name": "My Test Key",
  "expires_in_days": 30
}
```
7. Execute and copy the returned `api_key` value

#### Option B: Via curl

```bash
# First, login to get JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Use the returned token to create API key
curl -X POST http://localhost:8000/api-keys/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key_name":"My API Key","expires_in_days":30}'
```

**IMPORTANT:** Save the API key immediately! It's only shown once.

### 4. Use the API Key

Now you can use the API key to access chat endpoints without logging in:

```bash
# Get available models
curl -X GET http://localhost:8000/chat/models \
  -H "X-API-Key: sk_live_your_key_here"

# Send a chat message
curl -X POST http://localhost:8000/chat/stream \
  -H "X-API-Key: sk_live_your_key_here" \
  -F "conversation_id=your-conversation-id" \
  -F "message=Hello, how are you?" \
  -F "model=deepseek-v2:16b"
```

## Python Example

```python
import requests

# Configuration
API_KEY = "sk_live_your_key_here"
BASE_URL = "http://localhost:8000"

# Headers
headers = {
    "X-API-Key": API_KEY
}

# 1. Get available models
response = requests.get(f"{BASE_URL}/chat/models", headers=headers)
print("Models:", response.json())

# 2. Create a conversation (requires conversation endpoints)
# First, you need a conversation ID from the UI or create one via API

# 3. Send a message
conversation_id = "your-conversation-id"
data = {
    "conversation_id": conversation_id,
    "message": "What is Python?",
    "model": "deepseek-v2:16b"
}

response = requests.post(
    f"{BASE_URL}/chat/stream",
    headers=headers,
    data=data
)

# Handle streaming response
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

## API Key Management

### List Your API Keys

```bash
curl -X GET http://localhost:8000/api-keys/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Revoke an API Key

```bash
curl -X DELETE http://localhost:8000/api-keys/{key_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Best Practices

1. **Never commit API keys to version control**
2. **Store keys in environment variables**
3. **Use different keys for different environments** (dev, staging, prod)
4. **Set expiration dates** for temporary access
5. **Revoke unused keys** immediately
6. **Rotate keys regularly** (every 30-90 days)

## Troubleshooting

### "Invalid or expired API key"
- Check that you're using the correct key
- Verify the key hasn't been revoked
- Check if the key has expired

### "Authentication required"
- Make sure you're including the `X-API-Key` header
- Verify the header name is exactly `X-API-Key` (case-sensitive)

### "API key not found"
- The key may have been revoked
- Check that you copied the full key (starts with `sk_live_`)
