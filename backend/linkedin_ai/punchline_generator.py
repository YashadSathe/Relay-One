import logging
from .client import client

logger = logging.getLogger(__name__)

async def generate_punchline(post: str) -> str:
    prompt = f"""
    You are an expert visual content strategist. Your task is to read a LinkedIn post and extract a single, powerful "punchline" or "hook" from it. This punchline will be used as the main text on a visual (e.g., an image or a carousel card).

    Rules:
    - It must be very short (max 10 words).
    - It must capture the core message or most "scroll-stopping" idea.
    - It should be bold and intriguing.
    - Do NOT return explanations, just the punchline text.

     Post:
    "{post}"

    Punchline:
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini", # Or any model you prefer for this
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        punchline = response.choices[0].message.content.strip().replace('"', '') # Clean up quotes
        return punchline
    except Exception as e:
        logger.error(f"Failed to generate punchline. Error: {e}")
        return "" # Return empty string on failure