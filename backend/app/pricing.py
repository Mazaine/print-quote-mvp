from __future__ import annotations
from typing import Dict, Tuple, List

from .models import QuoteRequest, BreakdownItem

ANCHOR_PRICES: Dict[Tuple[str, int], int] = {
    ("A6", 100): 4500,
    ("A6", 250): 6500,
    ("A6", 500): 8500,
    ("A6", 1000): 12000,

    ("A5", 100): 6500,
    ("A5", 250): 9000,
    ("A5", 500): 12000,
    ("A5", 1000): 17000,

    ("A4", 100): 9500,
    ("A4", 250): 14000,
    ("A4", 500): 19000,
    ("A4", 1000): 27000,
}

SURCHARGE_PAPER_170G = 900
SURCHARGE_COLOR_4_0 = 1500
SURCHARGE_COLOR_4_4 = 3000
SURCHARGE_LAMINATION = 2000
MIN_PRICE = 5000


def calculate_quote(req: QuoteRequest) -> tuple[int, List[BreakdownItem]]:
    key = (req.size, int(req.qty))
    if key not in ANCHOR_PRICES:
        raise ValueError(f"No anchor price for size={req.size} qty={req.qty}")

    breakdown: List[BreakdownItem] = []

    anchor = ANCHOR_PRICES[key]
    breakdown.append(
        BreakdownItem(label=f"Anchor (130g, 1+0) — {req.size} / {req.qty} db", amount=anchor)
    )

    total = anchor

    if req.paper == "170g":
        total += SURCHARGE_PAPER_170G
        breakdown.append(BreakdownItem(label="Papír felár: 170g", amount=SURCHARGE_PAPER_170G))

    if req.color == "4+0":
        total += SURCHARGE_COLOR_4_0
        breakdown.append(BreakdownItem(label="Szín felár: 4+0", amount=SURCHARGE_COLOR_4_0))
    elif req.color == "4+4":
        total += SURCHARGE_COLOR_4_4
        breakdown.append(BreakdownItem(label="Szín felár: 4+4", amount=SURCHARGE_COLOR_4_4))

    if req.lamination:
        total += SURCHARGE_LAMINATION
        breakdown.append(BreakdownItem(label="Fóliázás felár", amount=SURCHARGE_LAMINATION))

    if total < MIN_PRICE:
        adjust = MIN_PRICE - total
        total = MIN_PRICE
        breakdown.append(BreakdownItem(label="Minimum ár korrekció", amount=adjust))

    return total, breakdown
