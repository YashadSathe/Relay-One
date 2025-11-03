from flask import jsonify, request, g
import logging
from database import db_manager
from models import User
from auth.jwt_service import jwt_service

logger = logging.getLogger(__name__)

def register_brand_brief_routes(app):
    
    @app.route('/api/brand-briefs', methods=['GET'])
    @jwt_service.require_auth
    def get_all_brand_briefs():
        """Get both personal and company brand briefs info"""
        try:
            user_id = g.user_id
            
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'personal_brand_brief': {
                        'content': user.personal_brand_brief_content or '',
                        'has_brand_brief': user.has_personal_brand_brief(),
                        'original_filename': user.personal_brand_original_filename,
                        'updated_at': user.personal_brand_updated_at.isoformat() if user.personal_brand_updated_at else None
                    },
                    'company_brand_brief': {
                        'content': user.company_brand_brief_content or '',
                        'has_brand_brief': user.has_company_brand_brief(),
                        'original_filename': user.company_brand_original_filename,
                        'updated_at': user.company_brand_updated_at.isoformat() if user.company_brand_updated_at else None
                    },
                    'active_brand_brief': user.active_brand_brief,
                    'has_any_brand_brief': user.has_any_brand_brief()
                })
                
        except Exception as e:
            logger.error(f"Error getting brand briefs for user {g.user_id}: {e}")
            return jsonify({'error': 'Failed to get brand briefs'}), 500
    
    @app.route('/api/brand-briefs/personal', methods=['GET'])
    @jwt_service.require_auth
    def get_personal_brand_brief():
        """Get personal brand brief content"""
        try:
            user_id = g.user_id
            
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'content': user.personal_brand_brief_content or '',
                    'has_brand_brief': user.has_personal_brand_brief(),
                    'original_filename': user.personal_brand_original_filename,
                    'updated_at': user.personal_brand_updated_at.isoformat() if user.personal_brand_updated_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting personal brand brief for user {g.user_id}: {e}")
            return jsonify({'error': 'Failed to get personal brand brief'}), 500
    
    @app.route('/api/brand-briefs/company', methods=['GET'])
    @jwt_service.require_auth
    # Get company brand brief content
    def get_company_brand_brief():
        try:
            user_id = g.user_id
            
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'content': user.company_brand_brief_content or '',
                    'has_brand_brief': user.has_company_brand_brief(),
                    'original_filename': user.company_brand_original_filename,
                    'updated_at': user.company_brand_updated_at.isoformat() if user.company_brand_updated_at else None
                })
                
        except Exception as e:
            logger.error(f"Error getting company brand brief for user {g.user_id}: {e}")
            return jsonify({'error': 'Failed to get company brand brief'}), 500
    
    @app.route('/api/brand-briefs/personal', methods=['POST'])
    @jwt_service.require_auth
    def create_personal_brand_brief():
        return _create_or_update_brand_brief(g.user_id, "personal")
    
    @app.route('/api/brand-briefs/company', methods=['POST'])
    @jwt_service.require_auth
    # Create or update company brand brief
    def create_company_brand_brief():  
        return _create_or_update_brand_brief(g.user_id, "company")
    
    @app.route('/api/brand-briefs/active', methods=['PUT'])
    @jwt_service.require_auth
    # Set which brand brief to use for generation
    def set_active_brand_brief():
        try:
            user_id = g.user_id
            data = request.get_json()
            if not data:
                return jsonify({'error': 'JSON body required'}), 400
            
            brief_type = data.get('brief_type', '').lower()
            if brief_type not in ['personal', 'company']:
                return jsonify({'error': 'Brief type must be "personal" or "company"'}), 400
            
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                # Check if the selected brief exists
                if brief_type == 'personal' and not user.has_personal_brand_brief():
                    return jsonify({'error': 'Personal brand brief not found. Please create it first.'}), 400
                elif brief_type == 'company' and not user.has_company_brand_brief():
                    return jsonify({'error': 'Company brand brief not found. Please create it first.'}), 400
                
                user.set_active_brand_brief(brief_type)
                
                logger.info(f"User {user_id} set active brand brief to: {brief_type}")
                
                return jsonify({
                    'message': f'Active brand brief set to {brief_type}',
                    'active_brand_brief': user.active_brand_brief
                })
                
        except Exception as e:
            logger.error(f"Error setting active brand brief for user {g.user_id}: {e}")
            return jsonify({'error': 'Failed to set active brand brief'}), 500
    
    @app.route('/api/brand-briefs/personal/upload', methods=['POST'])
    @jwt_service.require_auth
        # Upload personal brand brief as file
    def upload_personal_brand_brief():
        return _upload_brand_brief(g.user_id, "personal")
    
    @app.route('/api/brand-briefs/company/upload', methods=['POST'])
    @jwt_service.require_auth
    # Upload company brand brief as file
    def upload_company_brand_brief():
        return _upload_brand_brief(g.user_id, "company")

# Helper functions
# Create/update brand brief
def _create_or_update_brand_brief(user_id: str, brief_type: str):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON body required'}), 400
        
        content = data.get('content', '').strip()
        original_filename = data.get('original_filename')
        
        if not content:
            return jsonify({'error': 'Brand brief content is required'}), 400
        
        with db_manager.get_session() as session:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if brief_type == "personal":
                user.update_personal_brand_brief(content, original_filename)
            else:  # company
                user.update_company_brand_brief(content, original_filename)
            
            logger.info(f"User {user_id} updated {brief_type} brand brief")
            
            return jsonify({
                'message': f'{brief_type.capitalize()} brand brief saved successfully',
                'has_brand_brief': True,
                'brief_type': brief_type,
                'original_filename': original_filename,
                'content_preview': content[:100] + '...' if len(content) > 100 else content
            }), 201
            
    except Exception as e:
        logger.error(f"Error updating {brief_type} brand brief for user {user_id}: {e}")
        return jsonify({'error': f'Failed to save {brief_type} brand brief'}), 500

# Upload brand brief as file
def _upload_brand_brief(user_id: str, brief_type: str):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        content = file.read().decode('utf-8').strip()
        
        if not content:
            return jsonify({'error': 'File is empty'}), 400
        
        with db_manager.get_session() as session:
            user = session.query(User).filter(User.id == user_id).first()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if brief_type == "personal":
                user.update_personal_brand_brief(content, file.filename)
            else:  # company
                user.update_company_brand_brief(content, file.filename)
            
            logger.info(f"User {user_id} uploaded {brief_type} brand brief: {file.filename}")
            
            return jsonify({
                'message': f'{brief_type.capitalize()} brand brief uploaded successfully',
                'has_brand_brief': True,
                'brief_type': brief_type,
                'original_filename': file.filename,
                'content_length': len(content)
            })
            
    except Exception as e:
        logger.error(f"Error uploading {brief_type} brand brief for user {user_id}: {e}")
        return jsonify({'error': f'Failed to upload {brief_type} brand brief'}), 500