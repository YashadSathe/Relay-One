from .client import client

FT_MODEL = "ft:gpt-4o-mini-2024-07-18:personal::BRu3BO2w"

async def generate_post(topic: str, brand_brief: str) -> dict:
    prompt = f"""
    You are an expert LinkedIn content strategist working for a top-tier personal brand. Your task is to write a professional, compelling, and original post for LinkedIn.

    Objective:
    - Educate, inspire, or provoke thoughtful reflection using a story, insight, or trend.
    - Build authority while remaining human, grounded, and brand-aligned.

    Post Requirements:
    - **Topic**: {topic}
    - **Brand Brief**: {brand_brief}

    Guidelines:
    - Start with a strong hook that sparks curiosity or emotional resonance.
    -Deliver a clear narrative with flow (intro → insight → takeaway).
    - Use a confident, intelligent tone — **avoid hype, fear, or fluff**.
    - End with a reflective CTA that invites the reader to comment or think.

    Format:
    Return only the post text. Do not include any title, markdown, labels, or commentary.

    💡 Example hook styles:
    - A bold truth.
    - A surprising insight.
    - A personal moment with universal relevance.

    Now write the post:
    """

    try:
        response = await client.chat.completions.create(
            model=FT_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )

        post = response.choices[0].message.content.strip()

        return {
            "post": post
        }
    except Exception as e:
        logger.error(f"Failed to generate post using model. Error: {e}")