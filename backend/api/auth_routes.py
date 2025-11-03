from flask import jsonify, request, g
import logging
from datetime import datetime, timedelta
from database import db_manager
from models import User, UserSession
from auth.jwt_service import jwt_service

logger = logging.getLogger(__name__)

def register_auth_routes(app):
    
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """User registration endpoint"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON body required'}), 400
            
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            
            # Validation
            if not email or not password:
                return jsonify({'error': 'Email and password are required'}), 400
            
            if len(password) < 8:
                return jsonify({'error': 'Password must be at least 8 characters'}), 400
            
            with db_manager.get_session() as session:
                # Check if user already exists
                existing_user = session.query(User).filter(User.email == email).first()
                if existing_user:
                    return jsonify({'error': 'User already exists with this email'}), 409
                
                # Create new user
                user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                )
                user.set_password(password)
                
                session.add(user)
                session.flush()  # Get user ID without committing
                
                # Create access token
                access_token = jwt_service.create_access_token(user.id)
                refresh_token = jwt_service.create_refresh_token(user.id)
                
                # Update last login
                user.last_login = datetime.utcnow()
                
                logger.info(f"New user registered: {user.email}")
                
                return jsonify({
                    'message': 'User registered successfully',
                    'user': user.to_dict(),
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }), 201
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return jsonify({'error': 'Registration failed'}), 500
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """User login endpoint"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON body required'}), 400
            
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            if not email or not password:
                return jsonify({'error': 'Email and password are required'}), 400
            
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.email == email).first()
                
                if not user or not user.check_password(password):
                    return jsonify({'error': 'Invalid email or password'}), 401
                
                if not user.is_active:
                    return jsonify({'error': 'Account is deactivated'}), 403
                
                # Create tokens
                access_token = jwt_service.create_access_token(user.id)
                refresh_token = jwt_service.create_refresh_token(user.id)
                
                # Update last login
                user.last_login = datetime.utcnow()
                
                # Create session record (optional, for audit)
                session_record = UserSession(
                    user_id=user.id,
                    session_token=access_token,
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent'),
                    expires_at=datetime.utcnow() + timedelta(hours=24)
                )
                session.add(session_record)
                
                logger.info(f"User logged in: {user.email}")
                
                return jsonify({
                    'message': 'Login successful',
                    'user': user.to_dict(),
                    'access_token': access_token,
                    'refresh_token': refresh_token
                })
                
        except Exception as e:
            logger.error(f"Login error: {e}")
            return jsonify({'error': 'Login failed'}), 500
    
    @app.route('/api/auth/me', methods=['GET'])
    @jwt_service.require_auth
    def get_current_user():
        """Get current user info"""
        try:
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == g.user_id).first()
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'user': user.to_dict()
                })
                
        except Exception as e:
            logger.error(f"Get user error: {e}")
            return jsonify({'error': 'Failed to get user info'}), 500
    
    @app.route('/api/auth/refresh', methods=['POST'])
    def refresh_token():
        """Refresh access token using refresh token"""
        try:
            data = request.get_json()
            refresh_token = data.get('refresh_token') if data else None
            
            if not refresh_token:
                return jsonify({'error': 'Refresh token required'}), 400
            
            payload = jwt_service.verify_token(refresh_token)
            if not payload or payload.get('type') != 'refresh':
                return jsonify({'error': 'Invalid refresh token'}), 401
            
            user_id = payload['user_id']
            
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id, User.is_active == True).first()
                if not user:
                    return jsonify({'error': 'User not found or inactive'}), 404
                
                # Create new access token
                new_access_token = jwt_service.create_access_token(user.id)
                
                return jsonify({
                    'access_token': new_access_token
                })
                
        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            return jsonify({'error': 'Token refresh failed'}), 500
    
    @app.route('/api/auth/logout', methods=['POST'])
    @jwt_service.require_auth
    def logout():
        """Logout user (invalidate session)"""
        try:
            auth_header = request.headers.get('Authorization')
            token = auth_header.replace('Bearer ', '') if auth_header else None
            
            with db_manager.get_session() as session:
                if token:
                    # Delete session record
                    session.query(UserSession).filter(
                        UserSession.session_token == token
                    ).delete()
                
                logger.info(f"User logged out: {g.user_id}")
                
                return jsonify({
                    'message': 'Logout successful'
                })
                
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return jsonify({'error': 'Logout failed'}), 500