from venv import logger
from .client import client

FT_MODEL = "ft:gpt-4o-mini-2024-07-18:personal::BRu3BO2w"

async def rewrite_post(post: str, feedback: str, topic: str, brand_brief: str,brief_type: str = "personal" , model_name: str = FT_MODEL) -> str:
    if brief_type == "personal":    
        prompt = f"""
            You are a senior brand copywriter at a top-tier creative agency for personal brands. Your task is to **rewrite a LinkedIn post** based on professional editorial feedback — ensuring it meets the highest standards for clarity, engagement, and brand alignment.

            Objective:
            Use the provided feedback to **improve the original post**. You may restructure sentences, enhance the tone, sharpen the narrative, and eliminate fluff — but you must **preserve the original idea and voice**.

            Input Details:

            - Previous Draft:
            {post}

            - Feedback from Evaluator:
            {feedback}

            - Topic:
            {topic}

            - Brand Brief:
            {brand_brief}

            Rewrite Guidelines:

            - Start with a stronger **hook** if the original lacks one.
            - Ensure the post has a **clear progression**: hook → value → reflective close.
            - Keep the **tone aligned** with the brand brief — authentic, human, and insight-driven.
            - Avoid fluff, generic phrases, or robotic tone.
            - No hashtags or emojis unless explicitly asked.
            - Make sure the result reads like a **real, thoughtful human wrote it**.

            Output:
            Return only the **rewritten post text** — no headers, no bullet points, no formatting, no explanations. The response should be a clean, ready-to-publish LinkedIn post.

            Do not return:
            - Markdown
            - Evaluation
            - Old content
            - Notes or summaries

        """
    try:
        response = await client.chat.completions.create(
            model=FT_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Failed to rewrite post using model {model_name}, Error: {e}")
        return post