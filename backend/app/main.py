from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .db import engine, init_db
from .models import QuoteRequest, QuoteResponse
from .pricing import calculate_quote
from .pricing_service import seed_anchor_prices
from .routers.admin import router as admin_router

app = FastAPI(title="print-quote-mvp", version="0.1.0")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    with Session(engine) as session:
        seed_anchor_prices(session)


app.include_router(admin_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/quote/calculate", response_model=QuoteResponse)
def quote_calculate(payload: QuoteRequest):
    try:
        final_price, breakdown = calculate_quote(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return QuoteResponse(final_price=final_price, currency="HUF", breakdown=breakdown)
