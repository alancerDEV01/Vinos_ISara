from fastapi import APIRouter
from pydantic import BaseModel, Field

from modules.pairing.domain.engine import PairingEngine
from modules.pairing.domain.models import DishProfile, WineProfile

router = APIRouter(prefix="/pairings", tags=["pairings"])


class PairingDemoRequest(BaseModel):
    wine_acidity: float = Field(ge=0, le=1)
    wine_body: float = Field(ge=0, le=1)
    dish_fat: float = Field(ge=0, le=1)
    dish_intensity: float = Field(ge=0, le=1)
    same_region: bool = False


@router.post("/demo")
def pairing_demo(payload: PairingDemoRequest) -> dict[str, object]:
    """Endpoint temporal para validar el contrato del motor antes del catálogo."""
    result = PairingEngine().evaluate(
        wine=WineProfile(acidity=payload.wine_acidity, body=payload.wine_body),
        dish=DishProfile(fat=payload.dish_fat, intensity=payload.dish_intensity),
        same_region=payload.same_region,
    )
    return result.to_dict()
