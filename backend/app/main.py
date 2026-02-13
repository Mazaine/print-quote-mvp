from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import QuoteRequest, QuoteResponse
from .pricing import calculate_quote

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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/quote/calculate", response_model=QuoteResponse)
def quote_calculate(payload: QuoteRequest):
    final_price, breakdown = calculate_quote(payload)
    return QuoteResponse(final_price=final_price, currency="HUF", breakdown=breakdown)
