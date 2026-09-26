from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.database import Base

class PassAlert(Base):
    __tablename__ = "pass_alerts"
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    satellite_name = Column(
        String,
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    location_id = Column(
        Integer,
        ForeignKey("observer_locations.id"),
        nullable=False
    )
    min_elevation = Column(
        Float,
        nullable=False,
        default=0.0
    )
    enabled = Column(
        Boolean,
        nullable=False,
        default=True
    )
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    user = relationship(
        "DBUser",
        back_populates="pass_alerts"
    )
    location = relationship(
        "ObserverLocation",
        back_populates="pass_alerts"
    )