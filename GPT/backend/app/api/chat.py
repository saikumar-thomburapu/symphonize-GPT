"""
Chat API endpoints - Multi-model support with Image & File handling
"""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List 
from fastapi.responses import StreamingResponse
from ..models.chat import ChatRequest
from ..services.supabase_service import supabase_service
from ..services.ollama_service import ollama_service
from ..services.file_service import file_service
from ..utils.context_manager import context_manager
from ..api.auth import get_current_user
import json
import logging

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)

# Available models
AVAILABLE_MODELS = {
    "deepseek-v2:16b": "DeepSeek v2 16B",
    "qwen3-vl:8b": "Qwen 3 VL 8B",
}

DEFAULT_MODEL = "deepseek-v2:16b"

@router.get("/models")
async def get_available_models(current_user: dict = Depends(get_current_user)):
    """Get list of available models."""
    return {
        "models": [
            {"id": model_id, "name": model_name}
            for model_id, model_name in AVAILABLE_MODELS.items()
        ],
        "default": DEFAULT_MODEL
    }

@router.post("/stream")
async def send_message_stream(
    conversation_id: str = Form(...),
    message: str = Form(...),
    model: str = Form(DEFAULT_MODEL),
    files: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user)
):
    """Send message with optional file upload and get streaming response."""
    try:
        # Validate model
        if model not in AVAILABLE_MODELS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model {model} not available"
            )
        
        logger.info(f"\n{'='*60}")
        logger.info(f"🔵 CHAT STREAM REQUEST")
        logger.info(f"{'='*60}")
        logger.info(f"Conversation: {conversation_id}")
        logger.info(f"Model: {model}")
        logger.info(f"Message: {message[:50]}...")
        logger.info(f"Files: {len(files)}")
        logger.info(f"User: {current_user['id']}")
        
        # Verify conversation
        logger.info("📋 Verifying conversation...")
        conversation = await supabase_service.get_conversation_detail(
            conversation_id,
            current_user["id"]
        )
        
        if not conversation:
            logger.error("❌ Conversation not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        logger.info("✓ Conversation verified")
        
        # Process uploaded files
        file_contents = ""
        images_data = []
        
        for uploaded_file in files:
            try:
                file_bytes = await uploaded_file.read()
                file_result = await file_service.process_file(
                    file_bytes,
                    uploaded_file.filename,
                    uploaded_file.content_type
                )
                
                # Handle images separately for Qwen3 vision model
                if file_result.get('is_image'):
                    logger.info(f"📸 Storing image data: {uploaded_file.filename}")
                    images_data.append(file_result['image_data'])
                else:
                    # Handle text files
                    file_contents += f"\n--- File: {file_result['filename']} ---\n{file_result['extracted_text']}\n"
                    logger.info(f"✓ Processed file: {uploaded_file.filename}")
            except Exception as e:
                logger.error(f"Error processing file: {str(e)}")
                continue
        
        # Combine message with file contents
        full_message = message
        if file_contents:
            full_message = f"{message}\n\nFile Contents:{file_contents}"
        
        # Save user message (original message without file contents)
        logger.info("💾 Saving user message...")
        await supabase_service.save_message(
            conversation_id=conversation_id,
            role="user",
            content=message,
            model=None
        )
        logger.info("✓ User message saved")
        
        # Get conversation history
        logger.info("📚 Fetching conversation history...")
        messages = await supabase_service.get_conversation_messages(
            conversation_id
        )
        logger.info(f"✓ Got {len(messages)} messages from DB")
        
        # Prepare context
        logger.info("🧠 Preparing context...")
        formatted_messages = context_manager.extract_messages_from_db(messages)
        
        # Replace last user message with full_message (includes file contents)
        if formatted_messages and formatted_messages[-1]['role'] == 'user':
            formatted_messages[-1]['content'] = full_message
        
        # Add images to the last user message for vision models
        if images_data and model == "qwen3-vl:8b":
            logger.info(f"🖼️ Adding {len(images_data)} image(s) to message for Qwen3")
            
            # Prepare message with images for Qwen3 (Ollama format)
            last_msg = formatted_messages[-1] if formatted_messages else None
            if last_msg:
                # Build content array: text first, then images as base64
                content_array = [
                    {
                        "type": "text",
                        "text": last_msg['content']
                    }
                ]
                
                # Add images as base64 - Ollama Qwen3 format
                for img_data in images_data:
                    content_array.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": img_data['media_type'],
                            "data": img_data['data']
                        }
                    })
                
                # Replace content with content array
                last_msg['content'] = content_array
                logger.info(f"✓ Added {len(images_data)} image(s) to message - Format: Ollama Qwen3")
        
        system_prompt = context_manager.create_system_prompt()
        context = context_manager.prepare_context(
            formatted_messages,
            system_prompt=system_prompt
        )
        logger.info(f"✓ Context ready: {len(context)} total items")
        
        # Define streaming generator
        async def generate_stream():
            full_response = ""
            chunk_count = 0
            
            try:
                logger.info(f"\n{'='*60}")
                logger.info(f"🚀 STARTING OLLAMA STREAM")
                logger.info(f"{'='*60}")
                logger.info(f"Model: {model}")
                logger.info(f"Ollama Base URL: {ollama_service.base_url}")
                if images_data:
                    logger.info(f"📸 Images attached: {len(images_data)}")
                
                async for chunk in ollama_service.generate_response_stream(
                    messages=context,
                    model_name=model
                ):
                    full_response += chunk
                    chunk_count += 1
                    
                    if chunk_count % 10 == 0:
                        logger.debug(f"Streamed {chunk_count} chunks")
                    
                    yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
                
                logger.info(f"✓ STREAM COMPLETE ({chunk_count} chunks)")
                
                # Save AI response
                await supabase_service.save_message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_response,
                    model=model
                )
                logger.info("✓ AI response saved")
                
                yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
            except Exception as e:
                logger.error(f"❌ STREAM ERROR: {str(e)}", exc_info=True)
                yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

@router.get("/history/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get conversation messages."""
    try:
        conversation = await supabase_service.get_conversation_detail(
            conversation_id,
            current_user["id"]
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        messages = await supabase_service.get_conversation_messages(conversation_id)
        
        return {
            "conversation_id": conversation_id,
            "messages": messages
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"History error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching history: {str(e)}"
        )










# """
# Chat API endpoints - Multi-model support
# """


# from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File,Form
# from typing import List 
# from fastapi.responses import StreamingResponse
# from ..models.chat import ChatRequest
# from ..services.supabase_service import supabase_service
# from ..services.ollama_service import ollama_service
# from ..services.file_service import file_service
# from ..utils.context_manager import context_manager
# from ..api.auth import get_current_user
# import json
# import logging

# router = APIRouter(prefix="/chat", tags=["Chat"])
# logger = logging.getLogger(__name__)

 
# # Available models
# # AVAILABLE_MODELS = {
# #     "mistral:latest": "Mistral 7.2B",
# #     "qwen2.5-coder:7b": "Qwen Coder 7.6B",
# #     "llama2:latest": "Llama2 7B",
# # }

# # DEFAULT_MODEL = "mistral:latest"

# AVAILABLE_MODELS = {
#     "deepseek-v2:16b": "DeepSeek v2 16B",
#     "qwen3-vl:8b": "Qwen 3 VL 8B",
# }

# DEFAULT_MODEL = "deepseek-v2:16b"


# @router.get("/models")
# async def get_available_models(current_user: dict = Depends(get_current_user)):
#     """Get list of available models."""
#     return {
#         "models": [
#             {"id": model_id, "name": model_name}
#             for model_id, model_name in AVAILABLE_MODELS.items()
#         ],
#         "default": DEFAULT_MODEL
#     }

# @router.post("/stream")
# async def send_message_stream(
#     conversation_id: str = Form(...),
#     message: str = Form(...),
#     model: str = Form(DEFAULT_MODEL),
#     files: List[UploadFile] = File(default=[]),
#     current_user: dict = Depends(get_current_user)
# ):
#     """Send message with optional file upload and get streaming response."""
#     try:
#         # Validate model
#         if model not in AVAILABLE_MODELS:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail=f"Model {model} not available"
#             )
        
#         logger.info(f"\n{'='*60}")
#         logger.info(f"🔵 CHAT STREAM REQUEST")
#         logger.info(f"{'='*60}")
#         logger.info(f"Conversation: {conversation_id}")
#         logger.info(f"Model: {model}")
#         logger.info(f"Message: {message[:50]}...")
#         logger.info(f"Files: {len(files)}")
#         logger.info(f"User: {current_user['id']}")
        
#         # Verify conversation
#         logger.info("📋 Verifying conversation...")
#         conversation = await supabase_service.get_conversation_detail(
#             conversation_id,
#             current_user["id"]
#         )
        
#         if not conversation:
#             logger.error("❌ Conversation not found")
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Conversation not found"
#             )
#         logger.info("✓ Conversation verified")
        
#         # Process uploaded files
#         file_contents = ""
#         for uploaded_file in files:
#             try:
#                 file_bytes = await uploaded_file.read()
#                 file_result = await file_service.process_file(
#                     file_bytes,
#                     uploaded_file.filename,
#                     uploaded_file.content_type
#                 )
                
#                 file_contents += f"\n--- File: {file_result['filename']} ---\n{file_result['extracted_text']}\n"
#                 logger.info(f"Processed file: {uploaded_file.filename}")
#             except Exception as e:
#                 logger.error(f"Error processing file: {str(e)}")
#                 continue
        
#         # Combine message with file contents
#         full_message = message
#         if file_contents:
#             full_message = f"{message}\n\nFile Contents:{file_contents}"
        
#         # Save user message (original message without file contents)
#         logger.info("💾 Saving user message...")
#         await supabase_service.save_message(
#             conversation_id=conversation_id,
#             role="user",
#             content=message,
#             model=None
#         )
#         logger.info("✓ User message saved")
        
#         # Get conversation history
#         logger.info("📚 Fetching conversation history...")
#         messages = await supabase_service.get_conversation_messages(
#             conversation_id
#         )
#         logger.info(f"✓ Got {len(messages)} messages from DB")
        
#         # Prepare context
#         logger.info("🧠 Preparing context...")
#         formatted_messages = context_manager.extract_messages_from_db(messages)
        
#         # Replace last user message with full_message (includes file contents)
#         if formatted_messages and formatted_messages[-1]['role'] == 'user':
#             formatted_messages[-1]['content'] = full_message
        
#         system_prompt = context_manager.create_system_prompt()
#         context = context_manager.prepare_context(
#             formatted_messages,
#             system_prompt=system_prompt
#         )
#         logger.info(f"✓ Context ready: {len(context)} total items")
        
#         # Define streaming generator
#         async def generate_stream():
#             full_response = ""
#             chunk_count = 0
            
#             try:
#                 logger.info(f"\n{'='*60}")
#                 logger.info(f"🚀 STARTING OLLAMA STREAM")
#                 logger.info(f"{'='*60}")
#                 logger.info(f"Model: {model}")
#                 logger.info(f"Ollama Base URL: {ollama_service.base_url}")
                
#                 async for chunk in ollama_service.generate_response_stream(
#                     messages=context,
#                     model_name=model
#                 ):
#                     full_response += chunk
#                     chunk_count += 1
                    
#                     if chunk_count % 10 == 0:
#                         logger.debug(f"Streamed {chunk_count} chunks")
                    
#                     yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
                
#                 logger.info(f"✓ STREAM COMPLETE ({chunk_count} chunks)")
                
#                 # Save AI response
#                 await supabase_service.save_message(
#                     conversation_id=conversation_id,
#                     role="assistant",
#                     content=full_response,
#                     model=model
#                 )
#                 logger.info("✓ AI response saved")
                
#                 yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
#             except Exception as e:
#                 logger.error(f"❌ STREAM ERROR: {str(e)}", exc_info=True)
#                 yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
        
#         return StreamingResponse(
#             generate_stream(),
#             media_type="text/event-stream",
#             headers={
#                 "Cache-Control": "no-cache",
#                 "Connection": "keep-alive",
#             }
#         )
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"❌ CRITICAL ERROR: {str(e)}", exc_info=True)
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error: {str(e)}"
#         )

 

# @router.get("/history/{conversation_id}")
# async def get_conversation_history(
#     conversation_id: str,
#     current_user: dict = Depends(get_current_user)
# ):
#     """Get conversation messages."""
#     try:
#         conversation = await supabase_service.get_conversation_detail(
#             conversation_id,
#             current_user["id"]
#         )
        
#         if not conversation:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Conversation not found"
#             )
        
#         messages = await supabase_service.get_conversation_messages(conversation_id)
        
#         return {
#             "conversation_id": conversation_id,
#             "messages": messages
#         }
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"History error: {str(e)}", exc_info=True)
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error fetching history: {str(e)}"
#         )













 