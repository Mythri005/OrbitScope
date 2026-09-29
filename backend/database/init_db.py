from sqlalchemy import inspect, text

from database.database import engine, Base

from models.db_user import DBUser
from models.favorite_satellite import FavoriteSatellite
from models.observer_location import ObserverLocation
from models.pass_alert import PassAlert
from models.historical_tracking import HistoricalTracking


def create_tables():
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)

    if "users" in inspector.get_table_names():
        columns = {
            column["name"]
            for column in inspector.get_columns("users")
        }

        if "name" not in columns:
            with engine.begin() as connection:
                connection.execute(
                    text(
                        "ALTER TABLE users "
                        "ADD COLUMN name VARCHAR"
                    )
                )