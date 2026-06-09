from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker

from app.core.config import settings

from app.db.base import Base


DATABASE_URL = settings.DATABASE_URL


engine = create_engine(

    DATABASE_URL
)


SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine
)


# -----------------------------
# DATABASE SESSION DEPENDENCY
# -----------------------------

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()