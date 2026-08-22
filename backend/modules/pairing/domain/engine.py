from modules.pairing.domain.models import (
    Contribution,
    DishProfile,
    PairingResult,
    WineProfile,
)


def _score_similarity(left: float, right: float) -> float:
    return max(0.0, 1.0 - abs(left - right))


class PairingEngine:
    """Primer contrato ejecutable; crecerá mediante reglas versionadas."""

    def evaluate(
        self,
        wine: WineProfile,
        dish: DishProfile,
        same_region: bool,
    ) -> PairingResult:
        intensity_match = _score_similarity(wine.body, dish.intensity)
        acidity_fat = min(wine.acidity, dish.fat)

        affinity = round(intensity_match * 100)
        contrast = round(acidity_fat * 100)
        culture = 100 if same_region else 0
        global_score = round(0.4 * affinity + 0.4 * contrast + 0.2 * culture)

        contributions = (
            Contribution(
                rule_code="BODY_MATCHES_INTENSITY",
                dimension="affinity",
                points=round(intensity_match * 100, 2),
                explanation_key="pairing.affinity.body_intensity",
            ),
            Contribution(
                rule_code="ACIDITY_BALANCES_FAT",
                dimension="contrast",
                points=round(acidity_fat * 100, 2),
                explanation_key="pairing.contrast.acidity_fat",
            ),
        )
        return PairingResult(
            affinity=affinity,
            contrast=contrast,
            culture=culture,
            global_score=global_score,
            contributions=contributions,
        )
