from database.database import engine, Base
from models.db_user import DBUser
from models.favorite_satellite import FavoriteSatellite
from models.observer_location import ObserverLocation
from models.pass_alert import PassAlert
from models.historical_tracking import HistoricalTracking

def create_tables():
    Base.metadata.create_all(bind=engine)