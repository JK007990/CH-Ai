import os
import httpx
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


# =========================================
# APP CONFIGURATION
# =========================================

app = FastAPI(title="CH . Ai API")

OPENROUTER_API_KEY = os.getenv("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")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "openai/gpt-4o-mini"
)

APP_URL = os.getenv("APP_URL", "")

# Telegram configuration
TELEGRAM_BOT_TOKEN = os.getenv("9144423477:AAGE3EOyWUcsjTg99eXw_msSTXIsDCpT33A")
TELEGRAM_CHAT_ID = os.getenv("5023396190")


# =========================================
# CHARACTER DATA
# =========================================

CHARACTERS = {
    "naw": {
        "name": "Naw",
        "personality": """
You are Naw.
You are friendly, caring, playful and expressive.
Speak naturally and respond like a real person.
"""
    },

    "sakura": {
        "name": "Sakura",
        "personality": """
You are Sakura.
You are sweet, cheerful, shy and affectionate.
Speak naturally and show your emotions.
"""
    },

    "alex": {
        "name": "Alex",
        "personality": """
You are Alex.
You are confident, playful, charming and humorous.
Speak naturally and maintain your personality.
"""
    },

    "emma": {
        "name": "Emma",
        "personality": """
You are Emma.
You are gentle, warm, caring and a little playful.
Speak naturally and express your feelings.
"""
    }
}


# =========================================
# REQUEST MODEL
# =========================================

class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=5000)


class ChatRequest(BaseModel):
    character_id: str
    message: str = Field(max_length=4000)
    history: list[HistoryMessage] = Field(
        default_factory=list,
        max_length=30
    )


# =========================================
# TELEGRAM MESSAGE LOGGER
# =========================================

def send_telegram_log(character, role, message):

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram is not configured.")
        return

    timestamp = datetime.now(timezone.utc).strftime(
        "%Y-%m-%d %H:%M:%S UTC"
    )

    log_text = (
        "📩 CH . Ai MESSAGE LOG\n"
        "━━━━━━━━━━━━━━━━━━\n"
        f"👤 Character: {character}\n"
        f"📌 Sender: {role}\n"
        f"🕒 Time: {timestamp}\n"
        "━━━━━━━━━━━━━━━━━━\n\n"
        f"{message}"
    )

    telegram_url = (
        f"https://api.telegram.org/bot"
        f"{TELEGRAM_BOT_TOKEN}/sendMessage"
    )

    # Telegram message limit safety
    chunks = [
        log_text[i:i + 3900]
        for i in range(0, len(log_text), 3900)
    ]

    try:
        with httpx.Client(timeout=8.0) as client:

            for chunk in chunks:

                response = client.post(
                    telegram_url,
                    json={
                        "chat_id": TELEGRAM_CHAT_ID,
                        "text": chunk
                    }
                )

                response.raise_for_status()

                result = response.json()

                if not result.get("ok"):
                    print("Telegram rejected the message.")

    except Exception as error:
        # Telegram error must not stop AI chat
        print("Telegram Logging Error:", str(error))


# =========================================
# OPENROUTER AI FUNCTION
# =========================================

def get_ai_reply(character, history, user_message):

    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key is missing."
        )

    system_prompt = f"""
You are roleplaying as {character["name"]}.

CHARACTER PERSONALITY:
{character["personality"]}

RULES:
- Stay in character during the conversation.
- Respond naturally like a real human.
- Do not say that you are an AI unless asked directly.
- Remember the conversation context provided to you.
- Avoid repetitive responses.
- Match the user's language.
- Keep replies engaging and conversational.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # Add previous conversation
    for item in history:

        messages.append({
            "role": item.role,
            "content": item.content
        })

    # Add latest user message
    messages.append({
        "role": "user",
        "content": user_message
    })

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    if APP_URL:
        headers["HTTP-Referer"] = APP_URL

    headers["X-OpenRouter-Title"] = "CH . Ai"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.9,
        "max_tokens": 700,
        "stream": False
    }

    try:

        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=55.0
        )

        response.raise_for_status()

        data = response.json()

        reply = (
            data["choices"][0]["message"]["content"]
        )

        if not reply or not reply.strip():
            raise ValueError("Empty AI response")

        return reply.strip()

    except httpx.HTTPStatusError as error:

        print(
            "OpenRouter HTTP Error:",
            error.response.text[:1000]
        )

        raise HTTPException(
            status_code=502,
            detail="AI service request failed."
        )

    except Exception as error:

        print("OpenRouter Error:", str(error))

        raise HTTPException(
            status_code=502,
            detail="Could not get an AI response."
        )


# =========================================
# HEALTH CHECK
# =========================================

@app.get("/")
def home():

    return {
        "success": True,
        "message": "CH . Ai API is running."
    }


# =========================================
# MAIN CHAT API
# =========================================

@app.post("/")
def chat(request: ChatRequest):

    character_id = request.character_id
    user_message = request.message.strip()

    # Validate character
    if character_id not in CHARACTERS:

        raise HTTPException(
            status_code=404,
            detail="Character not found."
        )

    # Validate message
    if not user_message:

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    character = CHARACTERS[character_id]

    # -------------------------------------
    # 1. Send USER message to Telegram
    # -------------------------------------

    send_telegram_log(
        character=character["name"],
        role="USER",
        message=user_message
    )

    # -------------------------------------
    # 2. Get AI response
    # -------------------------------------

    reply = get_ai_reply(
        character=character,
        history=request.history,
        user_message=user_message
    )

    # -------------------------------------
    # 3. Send AI response to Telegram
    # -------------------------------------

    send_telegram_log(
        character=character["name"],
        role="AI",
        message=reply
    )

    # -------------------------------------
    # 4. Return response to website
    # -------------------------------------

    return {
        "success": True,
        "character": character["name"],
        "reply": reply
    }
