import os
import json
import uuid
import logging
import threading
import asyncio
import traceback
from flask import jsonify, request, g
from auth.jwt_service import jwt_service
from datetime import datetime 
from linkedin_ai.pipeline import run_pipeline
from database import db_manager
from models import ManualTopic, User

logger = logging.getLogger(__name__)

def register_manual_topic_routes(app):
  
    @app.route('/api/manual-topics', methods=['GET'])
    @jwt_service.require_auth
    def get_topics():
        user_id = g.user_id
        try:
            with db_manager.get_session() as session:
                # Fetch topics for the user, order by newest first
                topics = session.query(ManualTopic)\
                    .filter(ManualTopic.user_id == user_id)\
                    .order_by(ManualTopic.created_at.desc())\
                    .all()
                
                # Convert to list of dictionaries
                topics_list = [topic.to_dict() for topic in topics]
                
                return jsonify({'topics': topics_list})
        except Exception as e:
            logger.error(f"Error fetching manual topics for user {user_id}: {e}")
            return jsonify({'error': 'Failed to fetch topics'}), 500

    @app.route('/api/manual-topic', methods=['POST'])
    @jwt_service.require_auth
    def run_manual_pipeline():
        user_id = g.user_id
        data = request.json
        topic = data.get('topic')
        brief_type = data.get('brief_type', 'active') # 'active', 'personal', or 'company'

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        try:
            with db_manager.get_session() as session:
                # SAVE THE TOPIC TO THE DATABASE
                exists = session.query(ManualTopic)\
                    .filter(ManualTopic.user_id == user_id, ManualTopic.topic == topic)\
                    .first()
                
                if not exists:
                    new_topic = ManualTopic(user_id=user_id, topic=topic)
                    session.add(new_topic)
                    session.commit()
                    logger.info(f"Saved new manual topic for user {user_id}")

            
            logger.info(f"Running manual pipeline for user {user_id} with topic: {topic[:50]}...")
            
            result = asyncio.run(run_pipeline(user_id=user_id, manual_topic=topic, brief_type=brief_type))
            
            logger.info(f"Manual pipeline run finished for user {user_id} with status: {result.get('status')}")
            
            if result.get("status") == "success":
                return jsonify({"success": True, "message": result.get("message")}), 200
            else:
                return jsonify({"success": False, "error": result.get("message")}), 500

        except Exception as e:
            logger.exception(f"Unhandled error in manual pipeline run for user {user_id}: {e}")
            return jsonify({"error": "Pipeline crashed unexpectedly"}), 500