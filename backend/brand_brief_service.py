import logging
from typing import Optional, Dict, Any
from database import db_manager
from models import User

logger = logging.getLogger(__name__)

class BrandBriefService:
    # Get user's brand brief content from database
    def get_brand_brief(self, user_id: str, brief_type: str = "active") -> str:
        try:
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    logger.warning(f"User not found: {user_id}")
                    return ""
                
                if brief_type == "personal":
                    return user.personal_brand_brief_content or ""
                elif brief_type == "company":
                    return user.company_brand_brief_content or ""
                else:  # "active" - get whichever is set as active
                    return user.get_active_brand_brief()
                
        except Exception as e:
            logger.error(f"Error getting {brief_type} brand brief for user {user_id}: {e}")
            return ""

    # Get complete brand brief info for user
    def get_brand_brief_info(self, user_id: str) -> Dict[str, Any]:
        try:
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return {}
                
                return {
                    'personal': {
                        'has_brand_brief': user.has_personal_brand_brief(),
                        'original_filename': user.personal_brand_original_filename,
                        'updated_at': user.personal_brand_updated_at.isoformat() if user.personal_brand_updated_at else None,
                        'content_preview': (user.personal_brand_brief_content[:100] + '...') 
                            if user.personal_brand_brief_content and len(user.personal_brand_brief_content) > 100 
                            else user.personal_brand_brief_content
                    },
                    'company': {
                        'has_brand_brief': user.has_company_brand_brief(),
                        'original_filename': user.company_brand_original_filename,
                        'updated_at': user.company_brand_updated_at.isoformat() if user.company_brand_updated_at else None,
                        'content_preview': (user.company_brand_brief_content[:100] + '...') 
                            if user.company_brand_brief_content and len(user.company_brand_brief_content) > 100 
                            else user.company_brand_brief_content
                    },
                    'active_brand_brief': user.active_brand_brief,
                    'has_any_brand_brief': user.has_any_brand_brief()
                }
                
        except Exception as e:
            logger.error(f"Error getting brand brief info for user {user_id}: {e}")
            return {}
    
    # Check if user has brand brief
    def user_has_brand_brief(self, user_id: str, brief_type: str = "any") -> bool:
        try:
            with db_manager.get_session() as session:
                user = session.query(User).filter(User.id == user_id).first()
                if not user:
                    return False
                
                if brief_type == "personal":
                    return user.has_personal_brand_brief()
                elif brief_type == "company":
                    return user.has_company_brand_brief()
                else:  # "any"
                    return user.has_any_brand_brief()
                
        except Exception as e:
            logger.error(f"Error checking brand brief for user {user_id}: {e}")
            return False

# Global instance
brand_brief_service = BrandBriefService()