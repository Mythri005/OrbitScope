from sqlalchemy import Column, Integer, String
from database.database import Base
from sqlalchemy.orm import relationship

class DBUser(Base):
    __tablename__ = "users"
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    name = Column(
        String,
        nullable=True
    )
    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )
    hashed_password = Column(
        String,
        nullable=False
    )
    favorites = relationship(
        "FavoriteSatellite",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    locations = relationship(
        "ObserverLocation",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    pass_alerts = relationship(
        "PassAlert",
        back_populates="user",
        cascade="all, delete-orphan"
    )