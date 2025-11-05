import jwt
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, g, jsonify
import logging

logger = logging.getLogger(__name__)

class JWTService:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-super-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.access_token_expire_minutes = 60 * 24  # 24 hours
        self.refresh_token_expire_days = 30  # 30 days

        # For DEBUGGING
        print("--- JWT SERVICE INITIALIZED ---")
        if self.secret_key == 'your-super-secret-key-change-in-production':
            print("WARNING: Using default JWT secret key. .env file not loaded.")
        else:
            print(f"SUCCESS: JWT Service loaded with key from .env: ...{self.secret_key[-6:]}")
        print("---------------------------------")
    
    def create_access_token(self, user_id: str, additional_claims: Dict = None) -> str:
        """Create JWT access token"""
        expires_delta = timedelta(minutes=self.access_token_expire_minutes)
        expire = datetime.utcnow() + expires_delta
        
        payload = {
            "user_id": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        if additional_claims:
            payload.update(additional_claims)
            
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token"""
        expires_delta = timedelta(days=self.refresh_token_expire_days)
        expire = datetime.utcnow() + expires_delta
        
        payload = {
            "user_id": user_id,
            "exp": expire,            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
    
    def require_auth(self, f):
        """Authentication decorator for routes"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authentication required', 'code': 'MISSING_TOKEN'}), 401
            
            token = auth_header.replace('Bearer ', '')
            payload = self.verify_token(token)
            
            if not payload or payload.get('type') != 'access':
                return jsonify({'error': 'Invalid or expired token', 'code': 'INVALID_TOKEN'}), 401
            
            # Store user info in Flask context
            g.user_id = payload['user_id']
            g.user_payload = payload
            
            return f(*args, **kwargs)
        return decorated_function

# Global JWT service instance
jwt_service = JWTService()