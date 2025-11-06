from asyncio.log import logger
import os
import asyncio
import logging
from typing import Optional
from datetime import datetime
from database import db_manager
from models import User, GeneratedPost
from brand_brief_service import brand_brief_service
from .topic_generator import get_topic
from .post_generator import generate_post
from .post_evaluator import evaluate_post
from .post_rewriter import rewrite_post
from .integration import send_to_make, save_to_notion

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
output_path = os.path.join(DATA_DIR, "final_output.txt")

logger = logging.getLogger(__name__)

MAX_LOOPS = 3
MIN_SCORE = 7

class PipelineError(Exception):
    """Custom exception for pipeline-related errors"""
    pass

def save_post_to_db(user_id: str, result: dict) -> Optional[str]:
    """
    Saves the generated post result to the database for a specific user.
    """
    try:
        with db_manager.get_session() as session:
            new_post = GeneratedPost(
                user_id=user_id,
                topic=result["topic"]["topic"],
                original_post=result["original_post"],
                final_post=result["final_post"],
                brand_brief_type=result["brief_type"],
                score=result["score"],
                feedback=result["feedback"],
                reasoning=result["reasoning"],
                generation_loops=result["loops"],
                # Set defaults
                is_approved=False,
                is_published=False,
            )
            
            session.add(new_post)
            session.commit()
            
            # We need the ID for logging, so refresh the object
            session.refresh(new_post)
            post_id = new_post.id
            
            logger.info(f"✅ Successfully saved post {post_id} to DB for user {user_id}.")
            logger.info(f"📝 Post content preview: {result['final_post'][:100]}...")
            
            return post_id

    except Exception as e:
        logging.error(f"Failed to save post to database for user {user_id}: {e}")
        return None

async def run_pipeline(user_id: str, manual_topic: Optional[str] = None, brief_type: str = "active"):
    try:
        if brief_type == "active":
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    raise PipelineError("User not found")
                
                brief_type = user.active_brand_brief
                brand_brief_content = user.get_active_brand_brief()

        else:
            # get specific brief
            brand_brief_content = brand_brief_service.get_brand_brief(user_id, brief_type)

        if not brand_brief_content:
            raise PipelineError(f"Please create your {brief_type} brand brief first")
        
        logger.info(f"Using {brief_type} brand brief for user {user_id}")

        topic = await get_topic(brand_brief_content, manual_topic, brief_type)
        logging.info(f"Topic generated: {topic}")

        post_data = await generate_post(topic, brand_brief_content, brief_type)
        original_post = post_data["post"]
        post = post_data["post"]
        logging.info(f"Post generated: {post[:60]}...")

        score, feedback, reasoning = await evaluate_post(post, brand_brief_content, topic, brief_type)
        logging.info(f"Initial evaluation score: {score}, feedback: {feedback}, topic: {topic}")

        loops = 0
        while score < MIN_SCORE and loops < MAX_LOOPS:
            logging.info(f"Rewriting post, loop {loops+1}")
            post = await rewrite_post(post, feedback, topic, brand_brief_content, brief_type)
            logging.info(f"Rewritten post: {post[:60]}...")
            score, feedback, reasoning = await evaluate_post(post, brand_brief_content, topic, brief_type)
            logging.info(f"Re-evaluation score: {score}, feedback: {feedback}")
            loops += 1

        result = {
            "topic": topic,
            "original_post": original_post,
            "final_post": post,
            "brief_type": brief_type,
            "score": score,
            "feedback": feedback,
            "reasoning": reasoning,
            "loops": loops,
        }

        post_id = save_post_to_db(user_id, result)

        if not post_id:
            # Handle failure to save to DB
            return {"status": "error", "message": "Failed to save post to database."}

        # Add the new post_id to the result for integration
        result["post_id"] = post_id
        final_post = result["final_post"]

        logging.info("Saving result to Notion.")
        notion_success = await save_to_notion(result, is_manual=manual_topic is not None)

        if score >= MIN_SCORE:
            logging.info("Sending post to Make.")
            
            make_success = await send_to_make({
                "topic": topic,
                "final_post": final_post
                # Will add image part here after Visulizer integration
            })
            
            if make_success and notion_success:
                logging.info("Pipeline finished successfully.")
                return {"status": "success", "message": "Post scheduled and saved."}
            else:
                logging.warning("Pipeline finished with integration issues.")
                return {"status": "partial_success", "message": "Post generated but integration failed."}
        else:
            logging.warning("Pipeline finished: Post not up to mark.")
            return {"status": "failure", "message": "Post not up to mark. Try again!"}
    
    except Exception as e:
        logging.exception(f"Unhandled error in pipeline for user {user_id}: {e}")
        return {"status": "error", "message": "Pipeline crashed unexpectedly"}