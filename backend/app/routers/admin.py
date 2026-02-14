from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ..db import engine
from ..pricing_service import create_anchor, delete_anchor, list_anchors, update_anchor
from ..schemas.anchor import AnchorCreate, AnchorRead, AnchorUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/anchors", response_model=list[AnchorRead])
def get_anchors(
    product_code: str | None = Query(default=None),
    material_code: str | None = Query(default=None),
    size_key: str | None = Query(default=None),
    anchor_qty: int | None = Query(default=None),
):
    with Session(engine) as session:
        return list_anchors(
            session,
            product_code=product_code,
            material_code=material_code,
            size_key=size_key,
            anchor_qty=anchor_qty,
        )


@router.post("/anchors", response_model=AnchorRead, status_code=201)
def post_anchor(payload: AnchorCreate):
    with Session(engine) as session:
        try:
            return create_anchor(session, payload)
        except IntegrityError as exc:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="Anchor already exists for this product/material/size/qty combination.",
            ) from exc


@router.put("/anchors/{anchor_id}", response_model=AnchorRead)
def put_anchor(anchor_id: int, payload: AnchorUpdate):
    with Session(engine) as session:
        try:
            updated = update_anchor(session, anchor_id, payload)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except IntegrityError as exc:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="Anchor already exists for this product/material/size/qty combination.",
            ) from exc

        if updated is None:
            raise HTTPException(status_code=404, detail="Anchor not found")

        return updated


@router.delete("/anchors/{anchor_id}")
def remove_anchor(anchor_id: int):
    with Session(engine) as session:
        deleted = delete_anchor(session, anchor_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Anchor not found")

    return {"ok": True}
