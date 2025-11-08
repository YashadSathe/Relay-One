from flask import request, jsonify,g
import logging
from datetime import datetime
from auth.jwt_service import jwt_service
from database import db_manager
from models import User

logger = logging.getLogger(__name__)

ALLOWED_FREQUENCIES = ["daily", "weekdays", "alternate"]

def register_scheduler_routes(app):

    @app.route("/api/scheduler/settings", methods=["GET"])
    @jwt_service.require_auth
    def get_settings():
        # Get scheduler of user.
        user_id = g.user_id
        try:
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                
                return jsonify({
                    "active": user.scheduler_active,
                    "time": user.scheduler_time,
                    "frequency": user.scheduler_frequency
                })
        except Exception as e:
            logger.error(f"Error fetching scheduler settings for user {user_id}: {e}")
            return jsonify({"error": "Internal server error"}), 500

    @app.route("/api/scheduler/settings", methods=["POST"])
    @jwt_service.require_auth
    def update_settings():
        # Updates the scheduler settings for the *authenticated* user.
        user_id = g.user_id
        data = request.json
        if not data:
            return jsonify({"error": "Invalid or missing JSON body"}), 400

        try:
            active = data.get("active")
            time_str = data.get("time")
            frequency = data.get("frequency")

            if active is None or not isinstance(active, bool):
                raise ValueError("Invalid 'active' status. Must be true or false.")
            if not time_str:
                raise ValueError("Missing 'time' field.")
            if not frequency:
                raise ValueError("Missing 'frequency' field.")

            # Validate time format
            try:
                datetime.strptime(time_str, "%H:%M")
            except ValueError:
                raise ValueError(f"Invalid time format '{time_str}'. Must be HH:MM (24-hour).")
            
            # Validate frequency
            frequency = frequency.lower()
            if frequency not in ALLOWED_FREQUENCIES:
                raise ValueError(f"Invalid frequency. Must be one of {ALLOWED_FREQUENCIES}")
            
            # Update Database
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                
                # Update user object
                user.scheduler_active = active
                user.scheduler_time = time_str
                user.scheduler_frequency = frequency
                
                session.commit()
            
            return jsonify({"success": True, "message": "Scheduler updated successfully."})
        
        except ValueError as ve:
            return jsonify({"success": False, "error": str(ve)}), 400
        except Exception as e:
            logger.error(f"Error updating scheduler settings for user {user_id}: {e}")
            return jsonify({"success": False, "error": "Internal server error"}), 500
