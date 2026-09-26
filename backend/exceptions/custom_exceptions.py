class SatelliteNotFoundException(Exception):
    def __init__(self, satellite_name: str):
        self.satellite_name = satellite_name
        super().__init__(f"Satellite '{satellite_name}' not found.")

class TLEDownloadException(Exception):
    def __init__ (self):
        super().__init__("Unable to download TLE data. Please try again later.")

class PassPredictionUnavailableException(Exception):
    def __init__ (self):
        super().__init__("No pass prediction available.")