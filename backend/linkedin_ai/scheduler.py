import asyncio
import logging
import traceback
from .pipeline import run_pipeline
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.base import JobLookupError
from datetime import datetime
import json
import os
from database import db_manager
from models import User

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def post_content_job(user_id: str):
    logging.info(f"[Scheduler] Running pipeline for user_id: {user_id} at {datetime.now()}")
    try:
        asyncio.run(run_pipeline(user_id=user_id, manual_topic=None))
        logging.info("[Scheduler] Pipeline for user {user_id} finished successfully")
    except Exception as e:
        logging.error(f"[Scheduler Error for user {user_id}] {str(e)}")
        logging.error(traceback.format_exc())

def get_job_id(user_id: str) -> str:
    """Generates a unique, predictable job ID for a user."""
    return f"auto_post_user_{user_id}"

def update_user_job(user_id: str, active: bool, time_str: str, frequency: str):
    job_id = get_job_id(user_id)
    # remove the existing job to prevent duplicates
    try:
        scheduler.remove_job(job_id)
        logger.debug(f"Removed existing job: {job_id}")
    except JobLookupError:
        logger.debug(f"No existing job found for {job_id}, creating new one.")
        pass

    # If user's scheduler is active, create a new job
    if active:
        try:
            hour, minute = map(int, time_str.split(":"))
            
            # Create the correct trigger based on frequency
            if frequency.lower() == "daily":
                trigger = CronTrigger(hour=hour, minute=minute)
            elif frequency.lower() == "weekdays":
                trigger = CronTrigger(day_of_week='mon-fri', hour=hour, minute=minute)
            elif frequency.lower() == "alternate":
                trigger = CronTrigger(day='*/2', hour=hour, minute=minute)
            else:
                logger.warning(f"Invalid frequency '{frequency}' for user {user_id}. Job not scheduled.")
                return

            # Add the new job, passing the user_id as an argument
            scheduler.add_job(
                func=post_content_job,
                trigger=trigger,
                args=[user_id], # Pass the user_id to the job function
                id=job_id,
                replace_existing=False # We already removed it
            )
            logger.info(f"Scheduled job {job_id} for {frequency} at {time_str} UTC.")
        
        except ValueError:
            logger.error(f"Invalid time format '{time_str}' for user {user_id}. Job not scheduled.")
        except Exception as e:
            logger.error(f"Failed to schedule job for user {user_id}: {e}")
    
def initialize_scheduler(app):
    # Loads all users from the DB and schedules jobs for those with active automation.
    logger.info("Initializing scheduler... Loading active user jobs from database.")
    
    with app.app_context():
        try:
            with db_manager.get_session() as session:
                active_users = session.query(User).filter(User.scheduler_active == True).all()
                
                if not active_users:
                    logger.info("No active users found. Scheduler initialized empty.")
                    return

                for user in active_users:
                    update_user_job(
                        user.id,
                        user.scheduler_active,
                        user.scheduler_time,
                        user.scheduler_frequency
                    )
                logger.info(f"Successfully loaded and scheduled {len(active_users)} user jobs.")
        
        except Exception as e:
            logger.critical(f"FATAL: Could not initialize scheduler from database. {e}")
            logger.critical(traceback.format_exc())