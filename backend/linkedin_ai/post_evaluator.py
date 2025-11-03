from typing import Tuple
import json
import logging
from .client import client

async def evaluate_post(post: str, brand_brief: str, topic: str, good_examples: list = None) -> Tuple[int, str, str]:
    prompt = f"""
    You are a senior editorial reviewer at a top brand agency. Your job is to rigorously evaluate a draft LinkedIn post and provide a clear numeric score and highly actionable, specific feedback to help the writer reach a publish-ready standard.

    Brand Brief:
    {brand_brief}

    {"Good Example Posts:\n" + "\n---\n".join(good_examples) if good_examples else ""}

    Evaluation Criteria (assess each pillar):
    1. Clarity - Is the language readable, concise, and logically structured?
    2. Structure - Does the post follow a strong narrative: hook → value → close?
    3. Originality - Is the content fresh, thought-provoking, and non-generic?
    4. Engagement Potential - Would this post stop someone mid-scroll? Does it spark curiosity or emotion?
    5. Brand Voice Alignment - Does the tone and writing style match the brand brief?
    6. LinkedIn Fit - Is this post professional, relevant, and likely to perform well on LinkedIn?

    Scoring Rules:
    Score the post strictly on a 1-10 scale:
    - 9-10: Exceptional. Polished, original, and on-brand. Ready for publishing.
    - 7-8: Decent. Has potential but needs refinement.
    - 5-6: Lacking in clarity, voice, or depth. Requires major revisions.
    - 1-4: Poor quality. Off-brand, vague, or uninspiring.

    Post to Evaluate:
    {post}

    Topic:
    {topic}

    Output a JSON object:
    {{
      "score": 6,
      "reasoning": "Explain your reasoning for the score, referencing the criteria.",
      "feedback": "Give specific, actionable feedback for improvement. Be direct and constructive. If the post is already publish-ready, say so."
    }}

    DO NOT return strings like '6/10' or 'Score: 6'. Only return a clean numeric score.
    """  # <-- This ends the f-string
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    lines = response.choices[0].message.content.strip()

    try:
        data = json.loads(lines)
        
        score = int(data.get("score", 0))
        feedback = data.get("feedback", "No feedback provided.")
        reasoning = data.get("reasoning", "No reasoning provided.")
    
        return score, feedback, reasoning
    
    except Exception as e:
        logging.error("Failed to parse evaluation response as JSON.")
        raise e