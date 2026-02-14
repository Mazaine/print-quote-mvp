from datetime import datetime

from pydantic import BaseModel, Field


class AnchorCreate(BaseModel):
    product_code: str = Field(min_length=1)
    material_code: str = Field(min_length=1)
    size_key: str = Field(min_length=1)
    anchor_qty: int = Field(ge=1)
    anchor_price: float = Field(ge=0)
    currency: str = "HUF"


class AnchorUpdate(BaseModel):
    product_code: str | None = Field(default=None, min_length=1)
    material_code: str | None = Field(default=None, min_length=1)
    size_key: str | None = Field(default=None, min_length=1)
    anchor_qty: int | None = Field(default=None, ge=1)
    anchor_price: float | None = Field(default=None, ge=0)
    currency: str | None = None


class AnchorRead(BaseModel):
    id: int
    product_code: str
    material_code: str
    size_key: str
    anchor_qty: int
    anchor_price: float
    currency: str
    created_at: datetime
