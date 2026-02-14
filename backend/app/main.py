from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session

from .db import engine, init_db
from .models import BreakdownItem, QuoteRequest, QuoteResponse
from .pricing import calculate_quote
from .pricing_service import (
    calculate_anchor_quote,
    get_catalog,
    seed_anchor_prices,
    seed_product_specs,
    seed_sheet_prices,
    seed_sra3,
)
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
        seed_sra3(session)
        seed_sheet_prices(session)
        seed_product_specs(session)
        seed_anchor_prices(session)


app.include_router(admin_router)

SURCHARGE_PAPER_170G = 900
SURCHARGE_COLOR_4_0 = 1500
SURCHARGE_COLOR_4_4 = 3000
SURCHARGE_LAMINATION = 2000
MIN_PRICE = 5000

PRINT_PRODUCTS = [
    {
        "id": "flyer-a5",
        "slug": "szorolap-a5",
        "name": "Szórólap A5",
        "description": "Kétoldalas promóciós szórólap rövid határidővel.",
        "product_code": "flyer",
        "basePrice": 8900,
        "imageUrl": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "poster-a3",
        "slug": "poszter-a3",
        "name": "Poszter A3",
        "description": "Élénk színes poszter üzletekbe és rendezvényekre.",
        "product_code": "poster",
        "basePrice": 6900,
        "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "business-card-classic",
        "slug": "nevjegykartya-90x50",
        "name": "Névjegykártya 90x50",
        "description": "Klasszikus névjegy matt vagy fényes kivitelben.",
        "product_code": "business_card",
        "basePrice": 4900,
        "imageUrl": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "sticker-sheet",
        "slug": "matrica-iv",
        "name": "Matrica ív",
        "description": "Egyedi formájú, beltéri felhasználásra.",
        "product_code": "sticker",
        "basePrice": 5900,
        "imageUrl": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "rollup-standard",
        "slug": "rollup-85x200",
        "name": "Roll-up 85x200",
        "description": "Kiállításokra és bemutatókra kész roll-up rendszer.",
        "product_code": "rollup",
        "basePrice": 24900,
        "imageUrl": "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "brochure-a4",
        "slug": "brossura-a4",
        "name": "Brossúra A4 hajtott",
        "description": "Termékbemutatókhoz és árlistákhoz ideális.",
        "product_code": "brochure",
        "basePrice": 15900,
        "imageUrl": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "booklet-a5",
        "slug": "fuzet-a5",
        "name": "Füzet A5",
        "description": "Kisebb oldalszámú promóciós füzet.",
        "product_code": "booklet",
        "basePrice": 19900,
        "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "banner-custom",
        "slug": "molino-egyedi",
        "name": "Molinó egyedi méret",
        "description": "Időjárásálló kültéri reklámfelület.",
        "product_code": "banner",
        "basePrice": 12900,
        "imageUrl": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    },
]


class ProductPriceRequest(BaseModel):
    product_code: str
    size: str
    paper: str
    color: str
    qty: int
    lamination: bool = False


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/products")
def list_products():
    return PRINT_PRODUCTS


@app.get("/products/{slug}")
def product_details(slug: str):
    product = next((item for item in PRINT_PRODUCTS if item["slug"] == slug), None)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.get("/catalog")
def catalog():
    with Session(engine) as session:
        return get_catalog(session, PRINT_PRODUCTS)


@app.post("/price/calculate", response_model=QuoteResponse)
def price_calculate(payload: ProductPriceRequest):
    with Session(engine) as session:
        resolved_qty, anchor = calculate_anchor_quote(
            session,
            product_code=payload.product_code,
            size_key=payload.size,
            material_code=payload.paper,
            qty=payload.qty,
        )

    breakdown = [
        BreakdownItem(
            label=f"Anchor - {payload.product_code} / {payload.size} / {resolved_qty} db",
            amount=anchor,
        )
    ]
    total = anchor

    if payload.paper == "170g":
        total += SURCHARGE_PAPER_170G
        breakdown.append(BreakdownItem(label="Papír felár: 170g", amount=SURCHARGE_PAPER_170G))

    if payload.color == "4+0":
        total += SURCHARGE_COLOR_4_0
        breakdown.append(BreakdownItem(label="Szín felár: 4+0", amount=SURCHARGE_COLOR_4_0))
    elif payload.color == "4+4":
        total += SURCHARGE_COLOR_4_4
        breakdown.append(BreakdownItem(label="Szín felár: 4+4", amount=SURCHARGE_COLOR_4_4))

    if payload.lamination:
        total += SURCHARGE_LAMINATION
        breakdown.append(BreakdownItem(label="Fóliázás felár", amount=SURCHARGE_LAMINATION))

    if total < MIN_PRICE:
        adjust = MIN_PRICE - total
        total = MIN_PRICE
        breakdown.append(BreakdownItem(label="Minimum ár korrekció", amount=adjust))

    return QuoteResponse(final_price=total, currency="HUF", breakdown=breakdown)


@app.post("/quote/calculate", response_model=QuoteResponse)
def quote_calculate(payload: QuoteRequest):
    try:
        final_price, breakdown = calculate_quote(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return QuoteResponse(final_price=final_price, currency="HUF", breakdown=breakdown)
