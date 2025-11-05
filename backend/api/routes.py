import os
import logging
from flask import jsonify, request, g
from auth.jwt_service import jwt_service 
from database import db_manager 
from models import GeneratedPost

logger = logging.getLogger(__name__)

def register_routes(app):
    @app.route('/api/posts', methods=['GET'])
    @jwt_service.require_auth
    def get_posts():
        """Fetch all generated posts from storage."""
        user_id = g.user_id
        
        try:
            with db_manager.get_session() as session:
                # Query the database for posts belonging to this user
                user_posts = session.query(GeneratedPost)\
                    .filter(GeneratedPost.user_id == user_id)\
                    .order_by(GeneratedPost.created_at.desc())\
                    .all()

                logger.info(f"Loaded {len(user_posts)} posts from DB for user {user_id}")
                
                # Format posts for the frontend
                frontend_posts = []
                for post in user_posts:
                    frontend_posts.append({
                        'id': post.id,
                        'content': post.final_post,
                        'score': post.score,
                        'timestamp': post.created_at.isoformat(),
                        'topic': post.topic,
                        'feedback': post.feedback,
                        'is_approved': post.is_approved,
                        'is_published': post.is_published
                    })
                
                logger.info(f"Returning {len(frontend_posts)} posts to frontend")
                return jsonify({'posts': frontend_posts})

        except Exception as e:
            logger.error(f"Error fetching posts for user {user_id}: {e}")
            return jsonify({'error': 'Failed to fetch posts'}), 500