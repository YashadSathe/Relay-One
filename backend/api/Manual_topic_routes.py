import os
import json
import uuid
import logging
import threading
import asyncio
import traceback
from flask import jsonify, request
from datetime import datetime 
from linkedin_ai.pipeline import run_pipeline

logger = logging.getLogger(__name__)

TOPICS_DB_PATH = "manual_topics.json"
db_lock = threading.Lock()

def get_manual_topics_db():
    with db_lock:
        if not os.path.exists(TOPICS_DB_PATH):
            return []
        try:
            with open(TOPICS_DB_PATH, "r", encoding = "utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            logger.warning(f"Corrupt JSON file: {TOPICS_DB_PATH}. Resetting.")
            return []

def run_pipeline_in_thread(topic: str, brand_brief: str = None):
    logger.info(f"[Thread] Starting pipeline for manual topic: {topic}")
    try:
        asyncio.run(run_pipeline(brand_brief=brand_brief, manual_topic=topic))
        logger.info(f"[Thread] Pipeline finished for manual topic: {topic}")
    except Exception as e:
        logger.error(f"[Thread] Error in pipeline thread: {e}")
        logger.error(traceback.format_exc()) # Full error

def save_manual_topics_db(topics):
    with db_lock:
        with open(TOPICS_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(topics, f, indent=2)

def register_manual_topic_routes(app):
  
    @app.route('/api/manual-topic/health', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        return jsonify({'status': 'healthy', 'message': 'LinkedIn AI API is running'})

    @app.route('/api/manual-topics', methods=['GET'])
    def get_manual_topics():
        """
        Handles GET requests to fetch the recent topics, frontend's useEffect will call.
        """
        all_topics = get_manual_topics_db()
        # Return the 5 most recent topics
        return jsonify(all_topics[:5])


    @app.route('/api/manual-topic', methods=['POST'])
    def submit_manual_topic():
        """
        Handles POST requests to submit a new topic.
        This saves the topic AND runs the pipeline.
        """
        data = request.json
        topic = data.get('topic', '').strip() if data else ''
        brand_brief = data.get("brand", '').strip() if data else ''

        if not topic:
            return jsonify({'success': False, 'error': 'Missing or empty topic'}), 400

        # 1. Create the new topic object
        new_topic = {
            "id": str(uuid.uuid4()),
            "topic": topic,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M") 
        }

        # 2. Save to our "database"
        all_topics = get_manual_topics_db()
        all_topics.insert(0, new_topic) # Add to the front
        
        # Trim the list to only keep 5
        trimmed_topics = all_topics[:5]
        
        save_manual_topics_db(trimmed_topics)

        # 3. Start the AI pipeline in the background
        thread = threading.Thread(
            target=run_pipeline_in_thread, 
            args=(topic, brand_brief) # Pass both topic and brief
        )
        thread.daemon = True
        thread.start()

        # 4. Return success
        return jsonify({
            'success': True, 
            'message': f'Pipeline started for topic: {topic}',
            'new_topic': new_topic # Send the new topic back
        }), 201