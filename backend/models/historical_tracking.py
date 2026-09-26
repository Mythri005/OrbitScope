from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from database.database import Base

class HistoricalTracking(Base):
    __tablename__ = "historical_tracking"
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    satellite_name = Column(
        String,
        nullable=False,
        index=True
    )
    timestamp = Column(
        DateTime,
        nullable=False,
        index=True
    )
    latitude = Column(
        Float,
        nullable=False
    )
    longitude = Column(
        Float,
        nullable=False
    )
    altitude = Column(
        Float,
        nullable=False
    )