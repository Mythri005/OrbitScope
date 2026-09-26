from services.satellite_service import SatelliteService
service = SatelliteService()
# data = service.download_tle()
# print(data)

satellite_name = input("Enter satellite name: ")
positions = service.get_current_position(satellite_name)

if positions is None:
    print(f"\nSatellite '{satellite_name}' not found.")

else:
    print(f"\n{satellite_name} Current Position")
    print(f"Latitude : {positions['latitude']:.4f}")
    print(f"Longitude : {positions['longitude']:.4f}")
    print(f"Altitude : {positions['altitude']:.2f} km")
