import asyncio
import json
import logging
from typing import List, Optional, Dict, Any, Tuple
from dotenv import load_dotenv
from .client import client

logger = logging.getLogger(__name__)

async def get_topic(brand_brief: str, manual_topic: Optional[str] = None) -> Dict[str, Any]:
    if manual_topic:
        return {
            "topic": manual_topic,
            "source": "manual",
            "score": None
                }
    try:
        topics = await generate_best_topic(brand_brief)
        if not topics:
            raise ValueError("No topics were generated")

        scored = await score_topics(topics, brand_brief)
        if not scored:
            raise ValueError("No topics were scored")
    
    except Exception as e:

        logger.error(f"Failed to generate or score topics: {e}")
        return{
            "topic": "Error: Could not generate topic.",
            "source": "generated",
            "score": 0
        }

    # Safely get the best topic
    best_topic_info = sorted(scored, key=lambda x: x.get("score", 0), reverse=True)
    best_topic = best_topic_info[0].get("topic", "Default Topic")
    best_score = best_topic_info[0].get("score", 0)

    return {
        "topic": best_topic,
        "source": "generated",
        "score": best_score
    }

async def generate_best_topic(brief: str, num: int = 5, model_name: str = "gpt-3.5-turbo-1106") -> List[str]:
    prompt = f"""
    You are a LinkedIn growth strategist specializing in creating viral content for personal brands.

    Your task is to generate {num} **high-reach LinkedIn post topics** that are:
    - Inspired by **real trends and hot conversations currently active on LinkedIn and business media**
    - Strongly aligned with the brand voice and goals provided in the brief below
    - Specifically designed to attract **engagement (comments, shares)** and trigger **algorithmic visibility**

    Brand Brief:
    {brief}

    Each topic must:
    - Be built around a **timely, trending concept** (e.g. emerging tools, layoffs, tech shifts, business debates)
    - Sound like a **hook** for a story, opinion, or unique insight (not just a title)
    - Be sharp, bold, and scroll-stopping — avoid generic or vague phrasing
    - Be designed for professionals, founders, creators, or career-focused audiences

    Return ONLY a JSON object with a single key "topics" containing a list of {num} topic strings.
    Example:
    {{
      "topics": [
        "Topic 1...",
        "Topic 2..."
      ]
    }}
    """

    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return data.get("topics", [])
    except Exception as e:
        logger.error(f"Failed to generate topics: {e}")
        return []

async def score_topics(topics: List[str], brief: str, model_name: str = "gpt-3.5-turbo-1106") -> List[Dict[str, Any]]:
    prompt = f"""
    You are a strict brand-alignment evaluator. Score each of the following topics from 1-10 based *only* on how well they align with the provided brand brief.

    Brand Brief:
    {brief}

    Topics to Score:
    {json.dumps(topics)}

    Return ONLY a JSON object with a single key "scores". This key should contain a list of objects,
    where each object has "topic", "score" (an integer), and "reason" (a short string).

    Example:
    {{
      "scores": [
        {{"topic": "The topic text...", "score": 8, "reason": "Good alignment with objective X."}},
        {{"topic": "Another topic...", "score": 4, "reason": "Too generic and off-brand."}}
      ]
    }}
    """
    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return data.get("scores", [])
    except Exception as e:
        logger.error(f"Failed to score topics from LLM: {e}")
        return []