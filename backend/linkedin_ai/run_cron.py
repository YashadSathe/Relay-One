import logging
import traceback
from datetime import datetime, timezone, time
import asyncio
from dotenv import load_dotenv
load_dotenv()
from app import app
from database import db_manager
from models import User, GeneratedPost 
from linkedin_ai.pipeline import run_pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

def is_due(session, user: User, now_utc: datetime) -> bool:
    try:
        frequency = user.scheduler_frequency.lower()
        weekday = now_utc.weekday() 
        if frequency == "weekdays" and weekday >= 5: # It's Sat or Sun
            return False
        if frequency == "alternate" and now_utc.day % 2 == 0:
            return False

        try:
            scheduled_time = time.fromisoformat(user.scheduler_time)
            
            scheduled_dt = now_utc.replace(
                hour=scheduled_time.hour, 
                minute=scheduled_time.minute, 
                second=0, 
                microsecond=0
            )
        except ValueError:
            logger.error(f"Invalid time format '{user.scheduler_time}' for user {user.id}")
            return False

        time_since_scheduled = now_utc - scheduled_dt
        seconds_passed = time_since_scheduled.total_seconds()

        # DEBUG LOGG
        logger.info(f"[DEBUG User: {user.id}] DB Time (raw UTC): '{user.scheduler_time}'")
        logger.info(f"[DEBUG User: {user.id}] Server Time (UTC): {now_utc.strftime('%H:%M:%S')}")
        logger.info(f"[DEBUG User: {user.id}] Parsed DB Time (UTC): {scheduled_dt.strftime('%H:%M:%S')}")
        logger.info(f"[DEBUG User: {user.id}] Seconds Passed: {seconds_passed}")

        if not (0 <= seconds_passed < 600):
            return False

        # --- 3. Check for Existing Post
        today_utc_start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
        
        existing_post = session.query(GeneratedPost).filter(
            GeneratedPost.user_id == user.id,
            GeneratedPost.created_at >= today_utc_start
        ).first()

        # if existing_post:
        #     logger.info(f"Skipping user {user.id}: Post already generated today at {existing_post.created_at}")
        #     return False
            
        return True
        
    except Exception as e:
        logger.error(f"Error checking 'is_due' for user {user.id}: {e}")
        return False

async def run_pipeline_with_context(user_id: str):
    try:
        with app.app_context():
            await run_pipeline(user_id=user_id, manual_topic=None)
    except Exception as e:
        logger.error(f"Error during run_pipeline_with_context for user {user_id}: {e}")
        raise e

async def run_jobs():
    logger.info("Cron job started: Checking for due users...")
    now_utc = datetime.now(timezone.utc)
    
    tasks_to_run = []
    user_ids_to_run = []
    
    with app.app_context():
        try:
            with db_manager.get_session() as session:
                active_users = session.query(User).filter(User.scheduler_active == True).all()
            
                if not active_users:
                    logger.info("No active users. Exiting.")
                    return

                logger.info(f"Checking {len(active_users)} active users at {now_utc.strftime('%Y-%m-%d %H:%M:%S')} UTC...")
                
                for user in active_users:
                    # Pass the session to the is due check
                    if is_due(session, user, now_utc):
                        logger.info(f"User {user.id} is due. Adding to task queue.")
                        tasks_to_run.append(run_pipeline_with_context(user_id=user.id))
                        user_ids_to_run.append(user.id)
            
            if not tasks_to_run:
                logger.info("No users are due in the current time window.")
                return

            logger.info(f"Running pipelines for {len(tasks_to_run)} users: {user_ids_to_run}")
            
            results = await asyncio.gather(*tasks_to_run, return_exceptions=True)
            
            logger.info("Async gather finished. Checking results...")

            for user_id, result in zip(user_ids_to_run, results):
                if isinstance(result, Exception):
                    logger.error(f"--- PIPELINE FAILED for User: {user.id} ---")
                    logger.error(f"Error Type: {type(result).__name__}")
                    logger.error(f"Error Message: {result}")
                    traceback.print_exception(type(result), result, result.__traceback__)
                else:
                    logger.info(f"Pipeline for User: {user.id} completed successfully.")

        except Exception as e:
            logger.critical(f"FATAL: Cron job failed during main user query. {e}")
            logger.critical(traceback.format_exc())

if __name__ == "__main__":
    with app.app_context():
        asyncio.run(run_jobs())