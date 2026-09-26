import os
from dotenv import load_dotenv

load_dotenv()

TLE_URL = os.getenv("TLE_URL")
CACHE_DURATION_HOURS = int(
    os.getenv("CACHE_DURATION_HOURS", "1")
)