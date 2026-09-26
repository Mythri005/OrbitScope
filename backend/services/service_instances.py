from services.satellite_service import SatelliteService
from services.night_planner_service import NightPlannerService
from services.pass_alert_service import PassAlertService
from services.historical_tracking_service import HistoricalTrackingService

satellite_service = SatelliteService()
night_planner_service = NightPlannerService()
pass_alert_service = PassAlertService()

historical_tracking_service = HistoricalTrackingService(
    satellite_service
)