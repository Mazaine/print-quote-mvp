from __future__ import annotations
from typing import List

from sqlmodel import Session

from .db import engine
from .models import BreakdownItem, QuoteRequest
from .pricing_service import get_anchor_map, resolve_anchor_price

SURCHARGE_PAPER_170G = 900
SURCHARGE_COLOR_4_0 = 1500
SURCHARGE_COLOR_4_4 = 3000
SURCHARGE_LAMINATION = 2000
MIN_PRICE = 5000


def calculate_quote(req: QuoteRequest) -> tuple[int, List[BreakdownItem]]:
    with Session(engine) as session:
        anchor_map = get_anchor_map(
            session,
            product_code=req.product,
            material_code="130g",
            size_key=req.size,
        )

    if not anchor_map:
        raise ValueError(
            f"No anchor price for product={req.product} material=130g size={req.size}"
        )

    resolved_qty, anchor_price = resolve_anchor_price(anchor_map, int(req.qty))

    breakdown: List[BreakdownItem] = []

    anchor = int(round(anchor_price))
    breakdown.append(
        BreakdownItem(
            label=f"Anchor (130g, 1+0) - {req.size} / {resolved_qty} db",
            amount=anchor,
        )
    )

    total = anchor

    if req.paper == "170g":
        total += SURCHARGE_PAPER_170G
        breakdown.append(BreakdownItem(label="Papir felar: 170g", amount=SURCHARGE_PAPER_170G))

    if req.color == "4+0":
        total += SURCHARGE_COLOR_4_0
        breakdown.append(BreakdownItem(label="Szin felar: 4+0", amount=SURCHARGE_COLOR_4_0))
    elif req.color == "4+4":
        total += SURCHARGE_COLOR_4_4
        breakdown.append(BreakdownItem(label="Szin felar: 4+4", amount=SURCHARGE_COLOR_4_4))

    if req.lamination:
        total += SURCHARGE_LAMINATION
        breakdown.append(BreakdownItem(label="Foliazas felar", amount=SURCHARGE_LAMINATION))

    if total < MIN_PRICE:
        adjust = MIN_PRICE - total
        total = MIN_PRICE
        breakdown.append(BreakdownItem(label="Minimum ar korrekcio", amount=adjust))

    return total, breakdown
