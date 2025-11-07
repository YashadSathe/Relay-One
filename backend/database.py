import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from models import Base

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        
    def init_db(self, database_url: str = None):
        """Initialize database - reads from env or uses SQLite"""
        
        # NEW: Check environment for a production database URL
        prod_db_url = os.environ.get('DATABASE_URL')
        
        if prod_db_url:
            database_url = prod_db_url
            # Fix for Render's Postgres URL
            if database_url.startswith("postgres://"):
                 database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        elif not database_url:
            # ✅ Use SQLite - creates a file in your current directory
            database_url = "sqlite:///./Relay-One.db"
        
        logger.info(f"🔧 Setting up database: {database_url}")
        
        # Check if this is a SQLite database for specific args
        if database_url.startswith("sqlite"):
            connect_args = {"check_same_thread": False}
            poolclass = StaticPool
        else:
            # Production (Postgres) config
            connect_args = {}
            poolclass = None # Use default pool

        self.engine = create_engine(
            database_url,
            connect_args=connect_args,
            poolclass=poolclass,
            echo=True  # Show SQL queries in logs (helpful for debugging)
        )

        self.SessionLocal = sessionmaker(
            autocommit=False, 
            autoflush=False, 
            bind=self.engine
        )
        
        # Create all tables automatically
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("✅ Database tables created successfully!")
            
            # Test the connection
            with self.get_session() as session:
                session.execute(text("SELECT 1"))
                logger.info("✅ Database connection test passed!")
                
        except Exception as e:
            logger.error(f"❌ Database setup failed: {e}")
            raise
        
    @contextmanager
    def get_session(self):
        """Get database session with automatic cleanup"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()

# Global database instance
db_manager = DatabaseManager()