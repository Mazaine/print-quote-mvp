from __future__ import annotations
import math
from typing import List

from sqlmodel import Session

from .db import engine
from .models import BreakdownItem, QuoteRequest
from .pricing_service import calc_per_sheet, get_product_spec, get_sheet, get_sheet_price

SURCHARGE_PAPER_170G = 900
SURCHARGE_LAMINATION = 2000
MIN_PRICE = 5000


def calculate_quote(req: QuoteRequest) -> tuple[int, List[BreakdownItem]]:
    with Session(engine) as session:
        product_spec = get_product_spec(session, product_code=req.product, size_key=req.size)
        if product_spec is None:
            raise ValueError(f"No product spec for product={req.product} size={req.size}")

        sheet = get_sheet(session, product_spec.default_sheet_code)
        if sheet is None:
            raise ValueError(f"No sheet found for code={product_spec.default_sheet_code}")

        print_mode = req.color
        sheet_price = get_sheet_price(session, sheet.code, print_mode)
        if sheet_price is None:
            raise ValueError(f"No sheet price for sheet={sheet.code} print_mode={print_mode}")

    per_sheet = calc_per_sheet(sheet, product_spec)
    if per_sheet <= 0:
        raise ValueError(
            f"Product does not fit printable area: product={req.product} size={req.size}"
        )

    sheets_needed = int(math.ceil(int(req.qty) / per_sheet))
    billable_qty = sheets_needed * per_sheet
    printing_price = sheets_needed * sheet_price.base_price_per_sheet + sheet_price.setup_fee

    breakdown: List[BreakdownItem] = []
    breakdown.append(
        BreakdownItem(
            label=(
                f"Iv: {sheet.code} "
                f"(printable {sheet.printable_width_mm}x{sheet.printable_height_mm} mm)"
            ),
            amount=0,
        )
    )
    breakdown.append(BreakdownItem(label=f"Impozicio: {per_sheet} db/iv", amount=0))
    breakdown.append(BreakdownItem(label=f"Ivek szama: {sheets_needed} iv", amount=0))
    breakdown.append(BreakdownItem(label=f"Szamlazott darab: {billable_qty} db", amount=0))
    breakdown.append(
        BreakdownItem(
            label=f"Nyomtatas: {print_mode} - {sheets_needed} iv",
            amount=int(printing_price),
        )
    )

    total = int(printing_price)

    if req.paper == "170g":
        total += SURCHARGE_PAPER_170G
        breakdown.append(BreakdownItem(label="Papir felar: 170g", amount=SURCHARGE_PAPER_170G))

    if req.lamination:
        total += SURCHARGE_LAMINATION
        breakdown.append(BreakdownItem(label="Foliazas felar", amount=SURCHARGE_LAMINATION))

    if total < MIN_PRICE:
        adjust = MIN_PRICE - total
        total = MIN_PRICE
        breakdown.append(BreakdownItem(label="Minimum ar korrekcio", amount=adjust))

    return total, breakdown
