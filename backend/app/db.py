from contextlib import contextmanager

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    # Import models so SQLModel metadata includes AnchorPrice.
    from .models import AnchorPrice  # noqa: F401

    SQLModel.metadata.create_all(engine)


@contextmanager
def session_scope():
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
