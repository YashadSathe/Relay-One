import os
import json
import logging
from flask import jsonify, request
import threading
import asyncio

logger = logging.getLogger(__name__)

def register_routes(app):
    @app.route('/api/posts', methods=['GET'])
    def get_posts():
        """Fetch all generated posts from storage."""
        try:
            
            posts = []
            
            output_path = os.path.join(os.path.dirname(__file__), "..", "linkedin_ai", "data", "posts.json")
            logger.info(f"Looking for posts file at: {output_path}")

            # Check if file exists
            if os.path.exists(output_path):  
                logger.info("Posts file found, reading...")
                with open(output_path, "r", encoding="utf-8") as f:
                    posts = json.load(f)  
                
                logger.info(f"Loaded {len(posts)} posts from storage")
                
                # Ensure posts is a list
                if not isinstance(posts, list):
                    logger.warning("Posts file does not contain a list, resetting to empty")
                    posts = []
                
                # Sort by timestamp (newest first)
                posts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
                
                # Return only the fields needed by frontend
                frontend_posts = []
                for post in posts:
                    frontend_posts.append({
                        'id': post.get('id', 'unknown'),
                        'content': post.get('content', 'No content'),
                        'score': post.get('score', 0),
                        'timestamp': post.get('timestamp', '2020-01-01T00:00:00')
                    })
                
                logger.info(f"Returning {len(frontend_posts)} posts to frontend")
                return jsonify({'posts': frontend_posts})

            else:
                logger.warning("Posts file does not exist yet")
                return jsonify({'posts': []})  # Return empty array

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in posts file: {e}")
            return jsonify({'posts': []})  # Return empty instead of error
        except Exception as e:
            logger.error(f"Error fetching posts: {e}")
            return jsonify({'error': 'Failed to fetch posts'}), 500