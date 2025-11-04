import asyncio
import json
import logging
from typing import List, Optional, Dict, Any, Tuple
from .client import client

logger = logging.getLogger(__name__)

async def get_topic(brand_brief: str, manual_topic: Optional[str] = None, brief_type: str = "personal") -> Dict[str, Any]:
    if manual_topic:
        return {
            "topic": manual_topic,
            "source": "manual",
            "score": None,
            "brief_type": brief_type # track brief type for post
                }
    try:
        topics = await generate_best_topic(brand_brief, brief_type)
        if not topics:
            raise ValueError("No topics were generated")

        scored = await score_topics(topics, brand_brief, brief_type)
        if not scored:
            raise ValueError("No topics were scored")
    
    except Exception as e:

        logger.error(f"Failed to generate or score topics for {brief_type} brief: {e}")
        return{
            "topic": "Error: Could not generate topic.",
            "source": "generated",
            "score": 0,
            "brief_type": brief_type
        }

    # Safely get the best topic
    best_topic_info = sorted(scored, key=lambda x: x.get("score", 0), reverse=True)
    best_topic = best_topic_info[0].get("topic", "Default Topic")
    best_score = best_topic_info[0].get("score", 0)

    return {
        "topic": best_topic,
        "source": "generated",
        "score": best_score,
        "brief_type": brief_type
    }

async def generate_best_topic(brief: str, brief_type: str = "personal", num: int = 5, model_name: str = "gpt-3.5-turbo-1106") -> List[str]:

    if brief_type == "personal":
        prompt = f"""
        You are a LinkedIn growth strategist specializing in creating viral content for PERSONAL BRANDS.

        Your task is to generate {num} **high-reach LinkedIn post topics** for a PERSONAL BRAND that are:
        - Inspired by **real trends and hot conversations currently active on LinkedIn and business media**
        - Strongly aligned with the brand voice and goals provided in the brief below
        - Specifically designed to attract **engagement (comments, shares)** and trigger **algorithmic visibility**

        PERSONAL BRAND Brief:
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
        }}"""

    else:
        prompt = f"""
        You are a LinkedIn growth strategist specializing in creating viral content for COMPANY BRANDs.

        Your task is to generate {num} **high-reach LinkedIn post topics** for a COMPANY BRAND that are:
        - Inspired by **real trends and hot conversations currently active on LinkedIn and business media**
        - Strongly aligned with the COMPANY BRAND voice, products, and goals provided in the brief below
        - Specifically designed to attract **engagement (comments, shares)** and trigger **algorithmic visibility**

        COMPANY BRAND Brief:
        {brief}

        Each topic must:
        - Be built around a **timely, trending concept** relevant to the COMPANY's industry
        - Sound like a **hook** for company insights, case studies, or industry perspectives (not just a title)
        - Be professional, credible, and scroll-stopping — avoid overly promotional language
        - Highlight company expertise, solutions, or industry leadership
        - Be designed for B2B audiences, potential clients, or industry professionals

        Return ONLY a JSON object with a single key "topics" containing a list of {num} topic strings.
        Example:
        {{
          "topics": [
            "Topic 1...",
            "Topic 2..."
          ]
        }}"""

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

async def score_topics(topics: List[str], brief: str, brief_type: str = "personal", model_name: str = "gpt-3.5-turbo-1106") -> List[Dict[str, Any]]:
    prompt = f"""
    You are a strict brand-alignment evaluator. Score each of the following topics from 1-10 based *only* on how well they align with the provided {brief_type.upper()} brand brief.

    Brand Brief:
    {brief}

    Topics to Score:
    {json.dumps(topics)}

    Return ONLY a JSON object with a single key "scores". This key should contain a list of objects,
    where each object has "topic", "score" (an integer), and "reason" (a short string).

    Consider alignment with:
    - Brand voice and tone
    - Target audience relevance  
    - Content goals and objectives
    - Industry/niche appropriateness

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