from pydantic import BaseModel, ConfigDict

class FavoriteResponse(BaseModel):
    id: int
    satellite_name: str

    model_config = ConfigDict(from_attributes=True)