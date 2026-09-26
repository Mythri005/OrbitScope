from sqlalchemy import Column, Integer, String, ForeignKey
from database.database import Base
from sqlalchemy.orm import relationship

class FavoriteSatellite(Base):
    __tablename__ = "favorite_satellites"
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
    user = relationship(
        "DBUser",
        back_populates="favorites"
    )