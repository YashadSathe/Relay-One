from .pipeline import run_pipeline
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import json
import os
import logging
import traceback

CONFIG_PATH = "scheduler_config.json"
scheduler = BackgroundScheduler()

def post_content_job():
    logging.info(f"[Scheduler] Running pipeline at {datetime.now()}")
    try:
        import asyncio
        asyncio.run(run_pipeline(manual_topic=None))
        logging.info("[Scheduler] Pipeline finished successfully")
    except Exception as e:
        logging.error(f"[Scheduler Error] {str(e)}")
        logging.error(traceback.format_exc())
        # You might want to add notification/alert logic here

def load_config():
    if not os.path.exists(CONFIG_PATH):
        return {"active": False, "time": "09:00", "frequency": "daily"}  # ensure lowercase default
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
        if "frequency" in config:
            config["frequency"] = config["frequency"].lower()
        return config

def save_config(config):
    if "frequency" in config:
        config["frequency"] = config["frequency"].lower()
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f)

def schedule_job(time_str, frequency):
    hour, minute = map(int, time_str.split(":"))

    if frequency.lower() == "daily":
        trigger = CronTrigger(hour=hour, minute=minute)
    elif frequency.lower() == "weekdays":
        trigger = CronTrigger(day_of_week='mon-fri', hour=hour, minute=minute)
    elif frequency.lower() == "alternate":
        trigger = CronTrigger(day='*/2', hour=hour, minute=minute)
        # extra logic would go inside post_content_job for "alternate days"
    else:
        return  # Invalid frequency

    scheduler.add_job(
        func=post_content_job,
        trigger=trigger,
        id="auto_post",
        replace_existing=True
    )

def refresh_scheduler():
    config = load_config()
    scheduler.remove_all_jobs()
    if config.get("active"):
        schedule_job(config.get("time"), config.get("frequency"))