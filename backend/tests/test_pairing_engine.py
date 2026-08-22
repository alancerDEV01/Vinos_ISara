from modules.pairing.domain.engine import PairingEngine
from modules.pairing.domain.models import DishProfile, WineProfile


def test_exposes_independent_scores_and_contributions() -> None:
    result = PairingEngine().evaluate(
        WineProfile(acidity=0.9, body=0.8),
        DishProfile(fat=0.7, intensity=0.8),
        same_region=True,
    )

    assert result.affinity == 100
    assert result.contrast == 70
    assert result.culture == 100
    assert result.global_score == 88
    assert {item.rule_code for item in result.contributions} == {
        "BODY_MATCHES_INTENSITY",
        "ACIDITY_BALANCES_FAT",
    }
