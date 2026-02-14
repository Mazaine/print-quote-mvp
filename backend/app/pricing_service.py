import math
from typing import Dict, Tuple

from sqlalchemy import func, or_
from sqlmodel import Session, select

from .models import AnchorPrice, PrintSheet, ProductSpec, SheetPrice
from .schemas.anchor import AnchorCreate, AnchorUpdate

FLYER_SIZE_MM: dict[str, tuple[int, int]] = {
    "A6": (105, 148),
    "A5": (148, 210),
    "A4": (210, 297),
}


def seed_anchor_prices(session: Session) -> int:
    defaults = [
        AnchorPrice(product_code="banner", material_code="vinyl", size_key="custom", anchor_qty=1, anchor_price=3500.0),
        AnchorPrice(product_code="banner", material_code="vinyl", size_key="custom", anchor_qty=10, anchor_price=28000.0),
        AnchorPrice(product_code="banner", material_code="vinyl", size_key="custom", anchor_qty=50, anchor_price=120000.0),
        AnchorPrice(product_code="banner", material_code="vinyl", size_key="custom", anchor_qty=100, anchor_price=220000.0),
        AnchorPrice(product_code="sticker", material_code="paper", size_key="A4", anchor_qty=1, anchor_price=1200.0),
        AnchorPrice(product_code="sticker", material_code="paper", size_key="A4", anchor_qty=10, anchor_price=9000.0),
        AnchorPrice(product_code="sticker", material_code="paper", size_key="A4", anchor_qty=50, anchor_price=39000.0),
        AnchorPrice(product_code="sticker", material_code="paper", size_key="A4", anchor_qty=100, anchor_price=72000.0),
        AnchorPrice(product_code="poster", material_code="paper", size_key="A3", anchor_qty=1, anchor_price=1400.0),
        AnchorPrice(product_code="poster", material_code="paper", size_key="A3", anchor_qty=10, anchor_price=11000.0),
        AnchorPrice(product_code="poster", material_code="paper", size_key="A3", anchor_qty=50, anchor_price=48000.0),
        AnchorPrice(product_code="poster", material_code="paper", size_key="A3", anchor_qty=100, anchor_price=90000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A6", anchor_qty=100, anchor_price=4500.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A6", anchor_qty=250, anchor_price=6500.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A6", anchor_qty=500, anchor_price=8500.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A6", anchor_qty=1000, anchor_price=12000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A5", anchor_qty=100, anchor_price=6500.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A5", anchor_qty=250, anchor_price=9000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A5", anchor_qty=500, anchor_price=12000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A5", anchor_qty=1000, anchor_price=17000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A4", anchor_qty=100, anchor_price=9500.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A4", anchor_qty=250, anchor_price=14000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A4", anchor_qty=500, anchor_price=19000.0),
        AnchorPrice(product_code="flyer", material_code="130g", size_key="A4", anchor_qty=1000, anchor_price=27000.0),
        AnchorPrice(product_code="business_card", material_code="300g", size_key="90x50", anchor_qty=100, anchor_price=4900.0),
        AnchorPrice(product_code="business_card", material_code="300g", size_key="90x50", anchor_qty=250, anchor_price=6900.0),
        AnchorPrice(product_code="business_card", material_code="300g", size_key="90x50", anchor_qty=500, anchor_price=9900.0),
        AnchorPrice(product_code="business_card", material_code="300g", size_key="90x50", anchor_qty=1000, anchor_price=15900.0),
        AnchorPrice(product_code="rollup", material_code="PVC banner", size_key="85x200", anchor_qty=1, anchor_price=24900.0),
        AnchorPrice(product_code="rollup", material_code="PVC banner", size_key="85x200", anchor_qty=2, anchor_price=47900.0),
        AnchorPrice(product_code="rollup", material_code="PVC banner", size_key="85x200", anchor_qty=5, anchor_price=114900.0),
        AnchorPrice(product_code="rollup", material_code="PVC banner", size_key="85x200", anchor_qty=10, anchor_price=219900.0),
        AnchorPrice(product_code="brochure", material_code="135g", size_key="A4", anchor_qty=100, anchor_price=15900.0),
        AnchorPrice(product_code="brochure", material_code="135g", size_key="A4", anchor_qty=250, anchor_price=29900.0),
        AnchorPrice(product_code="brochure", material_code="135g", size_key="A4", anchor_qty=500, anchor_price=54900.0),
        AnchorPrice(product_code="booklet", material_code="115g", size_key="A5", anchor_qty=100, anchor_price=19900.0),
        AnchorPrice(product_code="booklet", material_code="115g", size_key="A5", anchor_qty=250, anchor_price=36900.0),
        AnchorPrice(product_code="booklet", material_code="115g", size_key="A5", anchor_qty=500, anchor_price=67900.0),
    ]

    inserted = 0
    for row in defaults:
        existing = session.exec(
            select(AnchorPrice)
            .where(AnchorPrice.product_code == row.product_code)
            .where(AnchorPrice.material_code == row.material_code)
            .where(AnchorPrice.size_key == row.size_key)
            .where(AnchorPrice.anchor_qty == row.anchor_qty)
        ).first()
        if existing is not None:
            continue

        session.add(row)
        inserted += 1

    if inserted:
        session.commit()

    return inserted


def seed_sra3(session: Session) -> int:
    existing = session.exec(select(PrintSheet).where(PrintSheet.code == "SRA3")).first()
    if existing is not None:
        return 0

    row = PrintSheet(
        code="SRA3",
        width_mm=320,
        height_mm=450,
        printable_width_mm=310,
        printable_height_mm=440,
    )
    session.add(row)
    session.commit()
    return 1


def seed_sheet_prices(session: Session) -> int:
    defaults = {
        "1+0": 600,
        "4+0": 1200,
        "4+4": 2000,
    }

    inserted = 0
    for print_mode, base_price in defaults.items():
        existing = session.exec(
            select(SheetPrice)
            .where(SheetPrice.sheet_code == "SRA3")
            .where(SheetPrice.print_mode == print_mode)
        ).first()
        if existing is not None:
            continue

        session.add(
            SheetPrice(
                sheet_code="SRA3",
                print_mode=print_mode,
                base_price_per_sheet=base_price,
                setup_fee=0,
            )
        )
        inserted += 1

    if inserted:
        session.commit()

    return inserted


def seed_product_specs(session: Session) -> int:
    rows = [
        ProductSpec(product_code="flyer", finished_w_mm=105, finished_h_mm=148, bleed_mm=3, default_sheet_code="SRA3"),
        ProductSpec(product_code="flyer", finished_w_mm=148, finished_h_mm=210, bleed_mm=3, default_sheet_code="SRA3"),
        ProductSpec(product_code="flyer", finished_w_mm=210, finished_h_mm=297, bleed_mm=3, default_sheet_code="SRA3"),
        ProductSpec(product_code="business_card", finished_w_mm=90, finished_h_mm=50, bleed_mm=3, default_sheet_code="SRA3"),
    ]

    inserted = 0
    for row in rows:
        existing = session.exec(
            select(ProductSpec)
            .where(ProductSpec.product_code == row.product_code)
            .where(ProductSpec.finished_w_mm == row.finished_w_mm)
            .where(ProductSpec.finished_h_mm == row.finished_h_mm)
        ).first()
        if existing is not None:
            continue

        session.add(row)
        inserted += 1

    if inserted:
        session.commit()

    return inserted


def get_sheet(session: Session, code: str) -> PrintSheet | None:
    return session.exec(select(PrintSheet).where(PrintSheet.code == code)).first()


def get_sheet_price(session: Session, sheet_code: str, print_mode: str) -> SheetPrice | None:
    return session.exec(
        select(SheetPrice)
        .where(SheetPrice.sheet_code == sheet_code)
        .where(SheetPrice.print_mode == print_mode)
    ).first()


def get_product_spec(session: Session, product_code: str, size_key: str | None) -> ProductSpec | None:
    if product_code == "flyer":
        if size_key is None or size_key not in FLYER_SIZE_MM:
            return None
        w_mm, h_mm = FLYER_SIZE_MM[size_key]
        return session.exec(
            select(ProductSpec)
            .where(ProductSpec.product_code == product_code)
            .where(ProductSpec.finished_w_mm == w_mm)
            .where(ProductSpec.finished_h_mm == h_mm)
        ).first()

    return session.exec(
        select(ProductSpec).where(ProductSpec.product_code == product_code).order_by(ProductSpec.id)
    ).first()


def calc_per_sheet(sheet: PrintSheet, product_spec: ProductSpec) -> int:
    effective_w = product_spec.finished_w_mm + 2 * product_spec.bleed_mm
    effective_h = product_spec.finished_h_mm + 2 * product_spec.bleed_mm

    normal = (sheet.printable_width_mm // effective_w) * (sheet.printable_height_mm // effective_h)
    rotated = (sheet.printable_width_mm // effective_h) * (sheet.printable_height_mm // effective_w)
    return max(normal, rotated)


def list_anchors(
    session: Session,
    product_code: str | None = None,
    material_code: str | None = None,
    size_key: str | None = None,
    anchor_qty: int | None = None,
) -> list[AnchorPrice]:
    query = select(AnchorPrice)

    if product_code:
        query = query.where(AnchorPrice.product_code == product_code)
    if material_code:
        query = query.where(AnchorPrice.material_code == material_code)
    if size_key:
        query = query.where(AnchorPrice.size_key == size_key)
    if anchor_qty is not None:
        query = query.where(AnchorPrice.anchor_qty == anchor_qty)

    query = query.order_by(
        AnchorPrice.product_code,
        AnchorPrice.material_code,
        AnchorPrice.size_key,
        AnchorPrice.anchor_qty,
    )

    return session.exec(query).all()


def list_anchors_paginated(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    product_code: str | None = None,
    material_code: str | None = None,
    size_key: str | None = None,
    anchor_qty: int | None = None,
    q: str | None = None,
) -> tuple[list[AnchorPrice], int]:
    base_query = select(AnchorPrice)
    count_query = select(func.count()).select_from(AnchorPrice)

    if product_code:
        base_query = base_query.where(AnchorPrice.product_code == product_code)
        count_query = count_query.where(AnchorPrice.product_code == product_code)
    if material_code:
        base_query = base_query.where(AnchorPrice.material_code == material_code)
        count_query = count_query.where(AnchorPrice.material_code == material_code)
    if size_key:
        base_query = base_query.where(AnchorPrice.size_key == size_key)
        count_query = count_query.where(AnchorPrice.size_key == size_key)
    if anchor_qty is not None:
        base_query = base_query.where(AnchorPrice.anchor_qty == anchor_qty)
        count_query = count_query.where(AnchorPrice.anchor_qty == anchor_qty)
    if q:
        pattern = f"%{q.strip()}%"
        criteria = or_(
            AnchorPrice.product_code.like(pattern),
            AnchorPrice.material_code.like(pattern),
            AnchorPrice.size_key.like(pattern),
        )
        base_query = base_query.where(criteria)
        count_query = count_query.where(criteria)

    total = int(session.exec(count_query).one() or 0)
    page = max(page, 1)
    page_size = max(1, min(page_size, 100))
    offset = (page - 1) * page_size

    rows = session.exec(
        base_query.order_by(
            AnchorPrice.product_code,
            AnchorPrice.material_code,
            AnchorPrice.size_key,
            AnchorPrice.anchor_qty,
        )
        .offset(offset)
        .limit(page_size)
    ).all()

    return rows, total


def bulk_update_anchor_prices(
    session: Session, updates: list[dict[str, float | int]]
) -> dict:
    updated = 0
    not_found_ids: list[int] = []

    for item in updates:
        anchor_id = int(item["id"])
        price = float(item["priceFt"])
        anchor = session.get(AnchorPrice, anchor_id)
        if anchor is None:
            not_found_ids.append(anchor_id)
            continue
        anchor.anchor_price = price
        session.add(anchor)
        updated += 1

    if updated:
        session.commit()

    return {"updated": updated, "notFoundIds": not_found_ids}


def bulk_delete_anchors(session: Session, ids: list[int]) -> dict:
    deleted = 0
    not_found_ids: list[int] = []

    for anchor_id in ids:
        anchor = session.get(AnchorPrice, int(anchor_id))
        if anchor is None:
            not_found_ids.append(int(anchor_id))
            continue
        session.delete(anchor)
        deleted += 1

    if deleted:
        session.commit()

    return {"deleted": deleted, "notFoundIds": not_found_ids}


def create_anchor(session: Session, payload: AnchorCreate) -> AnchorPrice:
    anchor = AnchorPrice(**payload.model_dump())
    session.add(anchor)
    session.commit()
    session.refresh(anchor)
    return anchor


def update_anchor(session: Session, anchor_id: int, payload: AnchorUpdate) -> AnchorPrice | None:
    anchor = session.get(AnchorPrice, anchor_id)
    if anchor is None:
        return None

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise ValueError("No fields to update")

    for key, value in updates.items():
        setattr(anchor, key, value)

    session.add(anchor)
    session.commit()
    session.refresh(anchor)
    return anchor


def delete_anchor(session: Session, anchor_id: int) -> bool:
    anchor = session.get(AnchorPrice, anchor_id)
    if anchor is None:
        return False

    session.delete(anchor)
    session.commit()
    return True


def get_anchor_map(
    session: Session,
    product_code: str,
    material_code: str,
    size_key: str,
) -> Dict[int, float]:
    rows = session.exec(
        select(AnchorPrice)
        .where(AnchorPrice.product_code == product_code)
        .where(AnchorPrice.material_code == material_code)
        .where(AnchorPrice.size_key == size_key)
        .order_by(AnchorPrice.anchor_qty)
    ).all()

    return {row.anchor_qty: row.anchor_price for row in rows}


def resolve_anchor_price(anchor_map: Dict[int, float], qty: int) -> Tuple[int, float]:
    if not anchor_map:
        raise ValueError("No anchors available")

    sorted_anchors = sorted(anchor_map.keys())

    for anchor_qty in reversed(sorted_anchors):
        if qty >= anchor_qty:
            return anchor_qty, anchor_map[anchor_qty]

    smallest = sorted_anchors[0]
    return smallest, anchor_map[smallest]


def get_calculator_options(session: Session) -> dict:
    rows = session.exec(
        select(AnchorPrice)
        .where(AnchorPrice.product_code == "flyer")
        .where(AnchorPrice.material_code == "130g")
        .order_by(AnchorPrice.size_key, AnchorPrice.anchor_qty)
    ).all()

    sizes = sorted({row.size_key for row in rows})
    qtys = sorted({int(row.anchor_qty) for row in rows})
    papers = ["130g", "170g"]
    colors = ["1+0", "4+0", "4+4"]

    valid_combinations = []
    for row in rows:
        for paper in papers:
            for color in colors:
                valid_combinations.append(
                    {
                        "size": row.size_key,
                        "paper": paper,
                        "qty": int(row.anchor_qty),
                        "color": color,
                    }
                )

    return {
        "products": [
            {
                "product_code": "flyer",
                "label": "Szórólap",
                "options": {
                    "size": sizes,
                    "paper": papers,
                    "qty": qtys,
                    "color": colors,
                },
                "valid_combinations": valid_combinations,
            }
        ]
    }


def get_catalog(session: Session, products: list[dict]) -> dict:
    anchor_rows = session.exec(
        select(AnchorPrice).order_by(
            AnchorPrice.product_code,
            AnchorPrice.size_key,
            AnchorPrice.material_code,
            AnchorPrice.anchor_qty,
        )
    ).all()
    print_modes = session.exec(select(SheetPrice.print_mode).distinct()).all()
    colors = sorted(print_modes) if print_modes else ["1+0", "4+0", "4+4"]

    by_product: dict[str, list[AnchorPrice]] = {}
    for row in anchor_rows:
        by_product.setdefault(row.product_code, []).append(row)

    catalog_products = []
    for product in products:
        product_code = product["product_code"]
        rows = by_product.get(product_code, [])

        if product_code == "business_card":
            sizes = ["90x50"]
        else:
            sizes = sorted({row.size_key for row in rows})

        papers = sorted({row.material_code for row in rows})
        quantities = sorted({int(row.anchor_qty) for row in rows})

        combinations = []
        for row in rows:
            size_value = "90x50" if product_code == "business_card" else row.size_key
            for color in colors:
                combinations.append(
                    {
                        "size": size_value,
                        "paper": row.material_code,
                        "quantity": int(row.anchor_qty),
                        "color": color,
                    }
                )

        catalog_products.append(
            {
                "id": product["id"],
                "slug": product["slug"],
                "name": product["name"],
                "description": product["description"],
                "basePrice": product["basePrice"],
                "imageUrl": product.get("imageUrl", ""),
                "product_code": product_code,
                "options": {
                    "sizes": sizes,
                    "papers": papers,
                    "quantities": quantities,
                    "colors": colors if rows else [],
                },
                "validCombinations": combinations,
            }
        )

    return {"products": catalog_products}


def calculate_anchor_quote(
    session: Session,
    product_code: str,
    size_key: str,
    material_code: str,
    qty: int,
) -> tuple[int, int]:
    anchor_map = get_anchor_map(
        session,
        product_code=product_code,
        material_code=material_code,
        size_key=size_key,
    )
    if not anchor_map:
        raise ValueError(
            f"No anchor price for product={product_code} material={material_code} size={size_key}"
        )

    resolved_qty, anchor_price = resolve_anchor_price(anchor_map, qty)
    return resolved_qty, int(round(anchor_price))
