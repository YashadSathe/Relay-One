import os
import asyncio
import logging
import json
import uuid
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime
from brand_brief_service import brand_brief_service
from .topic_generator import get_topic
from .post_generator import generate_post
from .post_evaluator import evaluate_post
from .post_rewriter import rewrite_post
from .integration import send_to_make, save_to_notion

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
output_path = os.path.join(DATA_DIR, "final_output.txt")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

load_dotenv()

MAX_LOOPS = 3
MIN_SCORE = 7

def save_posts_to_storage(result):
    try:
        posts_file = os.path.join(DATA_DIR, "posts.json")
        posts = []

        if os.path.exists(posts_file) and os.path.getsize(posts_file) > 0:
            try:
                with open(posts_file, "r", encoding = "utf-8") as f:
                    file_content = f.read().strip()
                    if file_content:
                        posts = json.loads(file_content)
                        logging.info(f"Loaded {len(posts)} existing posts")
            except (json.JSONDecodeError, Exception) as e:
                logging.warning(f"Cloud not read existing files, starting frest {e}")
                posts = []
        else:
            logging.info("No existing posts, starting fresh")
            
        new_post = {
            "id": str(uuid.uuid4()),
            "content": result["final_post"],
            "score": result["score"],
            "topic": result["topic"],
            "timestamp": datetime.now().isoformat(),
            "original_post": result["original_post"],
            "feedback": result["feedback"],
            "loops": result["loops"]
        }

        posts.append(new_post)

        # save to file
        with open(posts_file, "w", encoding = "utf-8") as f:
            json.dump(posts,f , indent = 2)
        
        logging.info(f"✅ Successfully saved post! Total posts now: {len(posts)}")
        logging.info(f"📝 Post content preview: {result['final_post'][:100]}...")

        return new_post["id"]

    except Exception as e:
        logging.error(f"Failed to save story to storage {e}")
        return None

async def run_pipeline(user_id: str, manual_topic: Optional[str] = None):
    try:
        brand_brief_content = brand_brief_service.get_brand_brief(user_id, brief_type)
        if not brand_brief_content:
            raise PipelineError(f"Please create your {brief_type} brand brief first")
            
        logging.info(f"Using {brief_type} brand brief for pipeline")

        topic = await get_topic(brand_brief_content, manual_topic)
        logging.info(f"Topic generated: {topic}")

        post_data = await generate_post(topic, brand_brief_content)
        original_post = post_data["post"]
        post = post_data["post"]
        logging.info(f"Post generated: {post[:60]}...")

        score, feedback, reasoning = await evaluate_post(post, brand_brief_content, topic)
        logging.info(f"Initial evaluation score: {score}, feedback: {feedback}, topic: {topic}")

        loops = 0
        while score < MIN_SCORE and loops < MAX_LOOPS:
            logging.info(f"Rewriting post, loop {loops+1}")
            post = await rewrite_post(post, feedback, topic, brand_brief_content)
            logging.info(f"Rewritten post: {post[:60]}...")
            score, feedback, reasoning = await evaluate_post(post, brand_brief_content, topic)
            logging.info(f"Re-evaluation score: {score}, feedback: {feedback}")
            loops += 1

        result = {
            "topic": topic,
            "original_post": original_post,
            "final_post": post,
            "score": score,
            "feedback": feedback,
            "reasoning": reasoning,
            "loops": loops
        }

        post_id = save_posts_to_storage(result)
        #For inspection
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write("LinkedIn AI Pipeline Output\n")
                f.write("=" * 40 + "\n")
                f.write(f"Topic: {result['topic']}\n")
                f.write(f"Score: {result['score']}/10\n")
                f.write(f"Feedback: {result['feedback']}\n")
                f.write(f"Reasoning: {result['reasoning']}\n")
                f.write(f"Loops: {result['loops']}\n\n")
                f.write("📝 Final Post:\n")
                f.write(result['final_post'] + "\n")
        except Exception as e:
            logging.error(f"Failed to write output file: {e}")

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
        logging.exception(f"Unhandled error in pipeline: {e}")
        return {"status": "error", "message": "Pipeline crashed unexpectedly"}