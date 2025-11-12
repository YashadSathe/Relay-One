from datetime import datetime, timedelta
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Float, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.dialects.postgresql import UUID
import uuid
import bcrypt

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))

    # PERSONAL BRAND BRIEF
    personal_brand_brief_content = Column(Text, default="")
    personal_brand_original_filename = Column(String(255))
    personal_brand_updated_at = Column(DateTime)
    
    # COMPANY BRAND BRIEF  
    company_brand_brief_content = Column(Text, default="")
    company_brand_original_filename = Column(String(255))
    company_brand_updated_at = Column(DateTime)

    # Which brand brief to use for generation (default: personal)
    active_brand_brief = Column(String(20), default="personal")  # "personal" or "company"

    # Scheduler
    scheduler_active = Column(Boolean, default=False, nullable=False)
    scheduler_time = Column(String(5), default="09:00", nullable=False)
    scheduler_frequency = Column(String(20), default="daily", nullable=False)

    # Auth & Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    posts = relationship("GeneratedPost", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    manual_topics = relationship("ManualTopic", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")
    
    # Hash and set password
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    # Verify password
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    # Update user's personal brand brief
    def update_personal_brand_brief(self, content: str, original_filename: str = None):
        self.personal_brand_brief_content = content.strip()
        if original_filename:
            self.personal_brand_original_filename = original_filename
        self.personal_brand_updated_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    # Update user's company brand brief
    def update_company_brand_brief(self, content: str, original_filename: str = None):
        self.company_brand_brief_content = content.strip()
        if original_filename:
            self.company_brand_original_filename = original_filename
        self.company_brand_updated_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    # Set which brand brief to use for generation
    def set_active_brand_brief(self, brief_type: str):
        if brief_type not in ["personal", "company"]:
            raise ValueError("Brief type must be 'personal' or 'company'")
        self.active_brand_brief = brief_type
        self.updated_at = datetime.utcnow()

     # Get content of the active brand brief
    def get_active_brand_brief(self) -> str:
        if self.active_brand_brief == "company":
            return self.company_brand_brief_content or ""
        else:
            return self.personal_brand_brief_content or ""
    
    # Check if user has a personal brand brief
    def has_personal_brand_brief(self) -> bool:
        return bool(self.personal_brand_brief_content and self.personal_brand_brief_content.strip())
    
    # Check if user has a company brand brief
    def has_company_brand_brief(self) -> bool:
        
        return bool(self.company_brand_brief_content and self.company_brand_brief_content.strip())
    
    # Check if user has at least one brand brief
    def has_any_brand_brief(self) -> bool:
        return self.has_personal_brand_brief() or self.has_company_brand_brief()
    
    # Safe serialization with both brand briefs and without sensitive data
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'personal_brand_brief': {
                'has_brand_brief': self.has_personal_brand_brief(),
                'original_filename': self.personal_brand_original_filename,
                'updated_at': self.personal_brand_updated_at.isoformat() if self.personal_brand_updated_at else None
            },
            'company_brand_brief': {
                'has_brand_brief': self.has_company_brand_brief(),
                'original_filename': self.company_brand_original_filename,
                'updated_at': self.company_brand_updated_at.isoformat() if self.company_brand_updated_at else None
            },
            'active_brand_brief': self.active_brand_brief,
            'has_any_brand_brief': self.has_any_brand_brief(),
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="sessions")


class GeneratedPost(Base):
    __tablename__ = "generated_posts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Content
    topic = Column(Text, nullable=False)
    original_post = Column(Text, nullable=False)
    final_post = Column(Text, nullable=False)

    punchline = Column(Text, nullable = True)
    
    # Track which brand brief was used
    brand_brief_type = Column(String(20), default="personal")  # "personal" or "company"
    
    # Evaluation
    score = Column(Float, nullable=False)
    feedback = Column(Text)
    reasoning = Column(Text)
    evaluation_metadata = Column(Text)
    
    # Pipeline metadata
    generation_loops = Column(Integer, default=0)
    is_approved = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="posts")

class ManualTopic(Base):
    __tablename__ = "manual_topics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    topic = Column(Text, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", back_populates="manual_topics")

    def to_dict(self):
        return {
            'id': self.id,
            'topic': self.topic,
            'created_at': self.created_at.isoformat()
        }