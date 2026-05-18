import re
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="VinChecker",
    description="Сбор информации об автомобиле по VIN из открытых источников (РБ).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}
REQUEST_TIMEOUT = 10

VIN_PATTERN = re.compile(r"^[A-HJ-NPR-Z0-9]{17}$", re.IGNORECASE)


def validate_vin(vin: str) -> str:
    vin = vin.strip().upper()
    if not VIN_PATTERN.match(vin):
        raise HTTPException(
            status_code=422,
            detail="Некорректный VIN. Должен содержать ровно 17 символов (A-Z, 0-9, без I/O/Q).",
        )
    return vin


def fetch_kaby(vin: str) -> dict | None:
    try:
        url = f"https://ka.by/vin/{vin}"
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        result = {}
        page_text = soup.get_text(separator="\n")
        lines = [l.strip() for l in page_text.splitlines() if l.strip()]

        known_labels = {
            "VIN": "vin",
            "Марка": "brand",
            "Страна ввоза": "country",
            "Дата растаможки": "customs_date",
        }

        for i, line in enumerate(lines):
            if line in known_labels and i + 1 < len(lines):
                key = known_labels[line]
                value = lines[i + 1]
                value = re.sub(r"[^\w\s/.,\-]", "", value).strip()
                if value:
                    result[key] = value

        if "brand" not in result:
            title = soup.find("title")
            if title:
                match = re.search(r"–\s*([A-Z\s]+)\s*–\s*KA\.BY", title.text)
                if match:
                    result["brand"] = match.group(1).strip()

        result["source_url"] = url
        return result if len(result) > 1 else None

    except Exception:
        return None


SOURCES = [
    ("ka.by", fetch_kaby),
]


def aggregate(vin: str) -> dict:
    collected = {}
    failed = []

    for source_name, fetcher in SOURCES:
        data = fetcher(vin)
        if data:
            collected[source_name] = data
        else:
            failed.append(source_name)

    return {
        "vin": vin,
        "sources_success": list(collected.keys()),
        "sources_failed": failed,
        "data": collected,
    }


class VinRequest(BaseModel):
    vin: str


@app.get("/")
def root():
    return {"status": "ok", "service": "VinChecker"}


@app.get("/check/{vin}")
def check_vin_get(vin: str):
    vin = validate_vin(vin)
    return aggregate(vin)


@app.post("/check")
def check_vin_post(body: VinRequest):
    vin = validate_vin(body.vin)
    return aggregate(vin)