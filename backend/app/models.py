from typing import Literal, List
from pydantic import BaseModel, Field

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
