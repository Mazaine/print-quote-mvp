from typing import Dict, Tuple

from sqlmodel import Session, select

from .models import AnchorPrice
from .schemas.anchor import AnchorCreate, AnchorUpdate


def seed_anchor_prices(session: Session) -> int:
    has_any = session.exec(select(AnchorPrice.id).limit(1)).first()
    if has_any is not None:
        return 0

    rows = [
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
    ]

    session.add_all(rows)
    session.commit()
    return len(rows)


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
