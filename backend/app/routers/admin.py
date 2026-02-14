from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ..db import engine
from ..order_store import ORDER_STATUS_VALUES, get_order, list_orders, update_order
from ..pricing_service import (
    bulk_delete_anchors,
    bulk_update_anchor_prices,
    create_anchor,
    delete_anchor,
    list_anchors_paginated,
    update_anchor,
)
from ..schemas.anchor import AnchorCreate, AnchorRead, AnchorUpdate

router = APIRouter(tags=["admin"])


class AnchorListResponse(BaseModel):
    data: list[AnchorRead]
    page: int
    pageSize: int
    total: int


class AnchorBulkUpdateItem(BaseModel):
    id: int
    priceFt: float = Field(ge=0)


class AnchorBulkUpdateRequest(BaseModel):
    updates: list[AnchorBulkUpdateItem]


class AnchorBulkDeleteRequest(BaseModel):
    ids: list[int]


class OrderListResponse(BaseModel):
    data: list[dict]
    page: int
    pageSize: int
    total: int


class OrderPatchRequest(BaseModel):
    status: Literal["Beérkezett", "Gyártás alatt", "Kész", "Átadva", "Elutasítva"] | None = None
    adminNote: str | None = None


class BulkOrderStatusRequest(BaseModel):
    ids: list[str]
    status: Literal["Beérkezett", "Gyártás alatt", "Kész", "Átadva", "Elutasítva"]


def _list_anchors_common(
    page: int,
    page_size: int,
    product_code: str | None,
    material_code: str | None,
    size_key: str | None,
    anchor_qty: int | None,
    q: str | None,
):
    with Session(engine) as session:
        data, total = list_anchors_paginated(
            session,
            page=page,
            page_size=page_size,
            product_code=product_code,
            material_code=material_code,
            size_key=size_key,
            anchor_qty=anchor_qty,
            q=q,
        )
    return AnchorListResponse(data=data, page=page, pageSize=page_size, total=total)


@router.get("/anchors", response_model=AnchorListResponse)
def get_anchors(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, alias="pageSize", ge=1, le=100),
    product_code: str | None = Query(default=None, alias="product"),
    material_code: str | None = Query(default=None, alias="paper"),
    size_key: str | None = Query(default=None, alias="size"),
    anchor_qty: int | None = Query(default=None, alias="qty"),
    q: str | None = Query(default=None),
):
    return _list_anchors_common(page, page_size, product_code, material_code, size_key, anchor_qty, q)


@router.get("/admin/anchors", response_model=AnchorListResponse)
def get_anchors_legacy(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, alias="pageSize", ge=1, le=100),
    product_code: str | None = Query(default=None),
    material_code: str | None = Query(default=None),
    size_key: str | None = Query(default=None),
    anchor_qty: int | None = Query(default=None),
    q: str | None = Query(default=None),
):
    return _list_anchors_common(page, page_size, product_code, material_code, size_key, anchor_qty, q)


@router.post("/anchors", response_model=AnchorRead, status_code=201)
@router.post("/admin/anchors", response_model=AnchorRead, status_code=201)
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
@router.put("/admin/anchors/{anchor_id}", response_model=AnchorRead)
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
@router.delete("/admin/anchors/{anchor_id}")
def remove_anchor(anchor_id: int):
    with Session(engine) as session:
        deleted = delete_anchor(session, anchor_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Anchor not found")

    return {"ok": True}


@router.patch("/anchors/bulk")
def patch_anchor_bulk(payload: AnchorBulkUpdateRequest):
    with Session(engine) as session:
        result = bulk_update_anchor_prices(
            session,
            updates=[{"id": item.id, "priceFt": item.priceFt} for item in payload.updates],
        )
    return result


@router.delete("/anchors/bulk")
def delete_anchor_bulk(payload: AnchorBulkDeleteRequest):
    with Session(engine) as session:
        result = bulk_delete_anchors(session, payload.ids)
    return result


@router.get("/admin/orders", response_model=OrderListResponse)
def get_admin_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, alias="pageSize", ge=1, le=100),
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
):
    data, total = list_orders(page=page, page_size=page_size, status=status, q=q)
    return OrderListResponse(data=data, page=page, pageSize=page_size, total=total)


@router.get("/admin/orders/{order_id}")
def get_admin_order_detail(order_id: str):
    order = get_order(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/admin/orders/{order_id}")
def patch_admin_order(order_id: str, payload: OrderPatchRequest):
    if payload.status is not None and payload.status not in ORDER_STATUS_VALUES:
        raise HTTPException(status_code=400, detail="Invalid status")

    updated = update_order(order_id, status=payload.status, admin_note=payload.adminNote)
    if updated is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@router.patch("/admin/orders/bulk-status")
def patch_admin_orders_bulk_status(payload: BulkOrderStatusRequest):
    if payload.status not in ORDER_STATUS_VALUES:
        raise HTTPException(status_code=400, detail="Invalid status")

    updated = 0
    not_found: list[str] = []
    for order_id in payload.ids:
        row = update_order(order_id, status=payload.status)
        if row is None:
            not_found.append(order_id)
        else:
            updated += 1

    return {"updated": updated, "notFoundIds": not_found}
