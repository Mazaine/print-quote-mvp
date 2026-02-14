from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field
from sqlalchemy import UniqueConstraint
from sqlmodel import Field as SQLField
from sqlmodel import SQLModel

Size = Literal["A6", "A5", "A4"]
Paper = Literal["130g", "170g"]
Color = Literal["1+0", "4+0", "4+4"]
Qty = Literal[100, 250, 500, 1000]


class QuoteRequest(BaseModel):
    product: Literal["flyer"] = "flyer"
    size: Size
    paper: Paper
    color: Color
    qty: Qty
    lamination: bool = False


class BreakdownItem(BaseModel):
    label: str
    amount: int


class QuoteResponse(BaseModel):
    final_price: int
    currency: Literal["HUF"] = "HUF"
    breakdown: List[BreakdownItem] = Field(default_factory=list)


class AnchorPrice(SQLModel, table=True):
    __tablename__ = "anchor_prices"
    __table_args__ = (
        UniqueConstraint(
            "product_code",
            "material_code",
            "size_key",
            "anchor_qty",
            name="uq_anchor_price_key",
        ),
    )

    id: Optional[int] = SQLField(default=None, primary_key=True)
    product_code: str = SQLField(index=True)
    material_code: str = SQLField(index=True)
    size_key: str = SQLField(index=True)
    anchor_qty: int = SQLField(index=True)
    anchor_price: float
    currency: str = SQLField(default="HUF")
    created_at: datetime = SQLField(default_factory=datetime.utcnow)
