from datetime import datetime, timezone
import aiohttp
import logging
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

MAKE_WEBHOOK_URL = os.getenv("MAKE_WEBHOOK_URL")
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")
NOTION_VERSION = os.getenv("NOTION_API_VERSION", "2022-06-28")

# Validate required variables
_missing = []
if not MAKE_WEBHOOK_URL:
    _missing.append("MAKE_WEBHOOK_URL")
if not NOTION_API_KEY:
    _missing.append("NOTION_API_KEY")
if not NOTION_DATABASE_ID:
   _missing.append("NOTION_DATABASE_ID")
if _missing:
    raise ValueError(f"Missing required environment variables: {', '.join(_missing)}")

headers = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION
}

async def send_to_make(result: dict):
    # Handle both dict and string topic formats
    topic = result.get("topic", "")
    if isinstance(topic, dict):
        topic = topic.get("topic", "")
    
    payload = {
        "topic": topic,
        "final_post": result.get("final_post", "")
    }

    logging.info(f"Sending to Make: {payload}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(MAKE_WEBHOOK_URL, json=payload) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logging.error(f"Make error: {resp.status}, {text}")
                    return False
                else:
                    logging.info("Make success")
                    return True
    except Exception as e:
        logging.exception(f"Make integration failed: {e}")
        return False

async def save_to_notion(result: dict, is_manual: bool = False):
    # Handle both dict and string topic formats
    topic = result.get('topic', 'Untitled')
    if isinstance(topic, dict):
        topic = topic.get("topic", "Untitled")

    score = result.get("score", 0)
    
    notion_payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Topic": {"title": [{"text": {"content": topic}}]},
            "Original Post": {"rich_text": [{"text": {"content": result.get('original_post', '')[:2000]}}]},
            "Final Post": {"rich_text": [{"text": {"content": result.get('final_post', '')[:2000]}}]},
            "Score": {"number": score},
            "Feedback": {"rich_text": [{"text": {"content": result.get('feedback', '')[:2000]}}]},
            "Loops": {"number": result.get("loops", 0)},
            "Created Time": {"date": {"start": datetime.now(timezone.utc).isoformat()}},
            "Status": {
                "select": {
                    "name": "Approved" if score >= 7 else "Rejected"
                }
            },
            "Manual Topic": {"checkbox": is_manual},
        }
    }

    try:
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout = timeout) as session:
            async with session.post("https://api.notion.com/v1/pages", headers=headers, json=notion_payload) as resp:
                text = await resp.text()
                if resp.status not in (200, 201):
                    logging.error(f"Notion error: {resp.status}, {text}\nPayload: {notion_payload}")
                    return False
                else:
                    logging.info(f"Notion success: {text}")
                    return True
    except Exception as e:
        logging.exception(f"Notion integration failed: {e}")
        return False