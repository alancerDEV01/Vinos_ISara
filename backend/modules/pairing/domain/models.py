from dataclasses import asdict, dataclass


def _validate_unit_interval(value: float, name: str) -> None:
    if not 0 <= value <= 1:
        raise ValueError(f"{name} must be between 0 and 1")


@dataclass(frozen=True)
class WineProfile:
    acidity: float
    body: float

    def __post_init__(self) -> None:
        _validate_unit_interval(self.acidity, "acidity")
        _validate_unit_interval(self.body, "body")


@dataclass(frozen=True)
class DishProfile:
    fat: float
    intensity: float

    def __post_init__(self) -> None:
        _validate_unit_interval(self.fat, "fat")
        _validate_unit_interval(self.intensity, "intensity")


@dataclass(frozen=True)
class Contribution:
    rule_code: str
    dimension: str
    points: float
    explanation_key: str


@dataclass(frozen=True)
class PairingResult:
    affinity: int
    contrast: int
    culture: int
    global_score: int
    contributions: tuple[Contribution, ...]
    engine_version: str = "rules-0.1.0"

    def to_dict(self) -> dict[str, object]:
        return {
            "scores": {
                "affinity": self.affinity,
                "contrast": self.contrast,
                "culture": self.culture,
                "global": self.global_score,
            },
            "engine_version": self.engine_version,
            "contributions": [asdict(item) for item in self.contributions],
        }
