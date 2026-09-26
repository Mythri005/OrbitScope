from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.database import Base

class ObserverLocation(Base):
    __tablename__ = "observer_locations"
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    name = Column(
        String,
        nullable=False
    )
    latitude = Column(
        Float,
        nullable=False
    )
    longitude = Column(
        Float,
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    user = relationship(
        "DBUser",
        back_populates="locations",
    )
    pass_alerts = relationship(
        "PassAlert",
        back_populates="location",
        cascade="all, delete-orphan"
    )