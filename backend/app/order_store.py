from __future__ import annotations

import uuid
from typing import Any

ORDER_STATUS_VALUES = ["Beérkezett", "Gyártás alatt", "Kész", "Átadva", "Elutasítva"]

_orders: list[dict[str, Any]] = []


def create_order(payload: dict[str, Any]) -> dict[str, Any]:
    order = {
        "id": str(uuid.uuid4()),
        "createdAt": payload.get("createdAt"),
        "customer": payload.get("customer", {}),
        "items": payload.get("items", []),
        "totalFt": payload.get("totalFt", 0),
        "status": "Beérkezett",
        "adminNote": None,
    }
    _orders.append(order)
    return order


def list_orders(
    page: int = 1, page_size: int = 20, status: str | None = None, q: str | None = None
) -> tuple[list[dict[str, Any]], int]:
    rows = _orders
    if status:
        rows = [row for row in rows if row.get("status") == status]

    if q:
        needle = q.strip().lower()

        def _match(item: dict[str, Any]) -> bool:
            customer = item.get("customer") or {}
            return (
                needle in str(item.get("id", "")).lower()
                or needle in str(customer.get("name", "")).lower()
                or needle in str(customer.get("email", "")).lower()
                or needle in str(customer.get("phone", "")).lower()
            )

        rows = [item for item in rows if _match(item)]

    total = len(rows)
    page = max(page, 1)
    page_size = max(1, min(page_size, 100))
    start = (page - 1) * page_size
    end = start + page_size
    return rows[start:end], total


def get_order(order_id: str) -> dict[str, Any] | None:
    return next((item for item in _orders if item.get("id") == order_id), None)


def update_order(
    order_id: str, status: str | None = None, admin_note: str | None = None
) -> dict[str, Any] | None:
    order = get_order(order_id)
    if order is None:
        return None

    if status is not None:
        order["status"] = status
    if admin_note is not None:
        order["adminNote"] = admin_note
    return order

