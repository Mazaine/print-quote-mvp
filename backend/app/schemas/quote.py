from typing import Any

from pydantic import BaseModel, Field, field_validator


class QuoteCustomer(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(min_length=3)
    phone: str = Field(min_length=1)
    company: str | None = None
    deadline: str | None = None
    note: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value:
            raise ValueError("Invalid email")
        return value


class QuoteCreateRequest(BaseModel):
    customer: QuoteCustomer
    items: list[dict[str, Any]]
    totalFt: float = Field(ge=0)
    createdAt: str


class QuoteCreateResponse(BaseModel):
    message: str
    id: str
