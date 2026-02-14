from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .db import engine, init_db
from .models import QuoteRequest, QuoteResponse
from .pricing import calculate_quote
from .pricing_service import (
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/products")
def list_products():
    return [
        {
            "id": "flyer-a5",
            "name": "Szórólap A5",
            "description": "Kétoldalas promóciós szórólap rövid határidővel.",
            "product_code": "flyer",
            "basePrice": 8900,
            "options": {
                "size": ["A6", "A5", "A4"],
                "paper": ["Papír 130g", "Papír 170g"],
                "quantity": [100, 250, 500, 1000],
                "sides": ["1+0", "4+0", "4+4"],
                "extras": ["Laminálás"]
            }
        },
        {
            "id": "poster-a3",
            "name": "Poszter A3",
            "description": "Élénk színes poszter üzletekbe és rendezvényekre.",
            "product_code": "poster",
            "basePrice": 6900,
            "options": {
                "size": ["A3", "A2"],
                "paper": ["Papír 170g", "Papír 200g"],
                "quantity": [10, 25, 50, 100],
                "sides": ["4+0", "4+4"],
                "extras": ["UV lakkozás"]
            }
        },
        {
            "id": "business-card-classic",
            "name": "Névjegykártya 90x50",
            "description": "Klasszikus névjegy matt vagy fényes kivitelben.",
            "product_code": "business_card",
            "basePrice": 4900,
            "options": {
                "size": ["90x50 mm"],
                "paper": ["Papír 300g", "Papír 350g"],
                "quantity": [100, 250, 500, 1000],
                "sides": ["4+0", "4+4"],
                "extras": ["Laminálás", "Sarokkerekítés"]
            }
        },
        {
            "id": "sticker-sheet",
            "name": "Matrica ív",
            "description": "Egyedi formájú, beltéri felhasználásra.",
            "product_code": "sticker",
            "basePrice": 5900,
            "options": {
                "size": ["A6", "A5", "A4"],
                "paper": ["Öntapadó papír", "Öntapadó fólia"],
                "quantity": [50, 100, 250, 500],
                "sides": ["4+0"],
                "extras": ["Kontúrvágás"]
            }
        },
        {
            "id": "rollup-standard",
            "name": "Roll-up 85x200",
            "description": "Kiállításokra és bemutatókra kész roll-up rendszer.",
            "product_code": "rollup",
            "basePrice": 24900,
            "options": {
                "size": ["85x200 cm", "100x200 cm"],
                "paper": ["PVC banner", "Prémium film"],
                "quantity": [1, 2, 5, 10],
                "sides": ["4+0"],
                "extras": ["Hordtáska"]
            }
        },
        {
            "id": "brochure-a4",
            "name": "Brossúra A4 hajtott",
            "description": "Termékbemutatókhoz és árlistákhoz ideális.",
            "product_code": "brochure",
            "basePrice": 15900,
            "options": {
                "size": ["A4", "A5"],
                "paper": ["Papír 135g", "Papír 170g"],
                "quantity": [100, 250, 500],
                "sides": ["4+4"],
                "extras": ["Tűzés", "Hajtás"]
            }
        },
        {
            "id": "booklet-a5",
            "name": "Füzet A5",
            "description": "Kisebb oldalszámú promóciós füzet.",
            "product_code": "booklet",
            "basePrice": 19900,
            "options": {
                "size": ["A5"],
                "paper": ["Papír 115g", "Papír 135g"],
                "quantity": [100, 250, 500],
                "sides": ["4+4"],
                "extras": ["Tűzés", "Laminálás"]
            }
        },
        {
            "id": "banner-custom",
            "name": "Molinó egyedi méret",
            "description": "Időjárásálló kültéri reklámfelület.",
            "product_code": "banner",
            "basePrice": 12900,
            "options": {
                "size": ["egyedi"],
                "paper": ["PVC 440g", "Mesh"],
                "quantity": [1, 2, 5, 10],
                "sides": ["4+0"],
                "extras": ["Ringlizés", "Hegesztett szél"]
            }
        }
    ]


@app.post("/quote/calculate", response_model=QuoteResponse)
def quote_calculate(payload: QuoteRequest):
    try:
        final_price, breakdown = calculate_quote(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return QuoteResponse(final_price=final_price, currency="HUF", breakdown=breakdown)
