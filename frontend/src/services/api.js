const API_BASE = "http://127.0.0.1:8001";

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a termékeket.");
  }

  return response.json();
}

export async function fetchProductBySlug(slug) {
  const response = await fetch(`${API_BASE}/products/${slug}`);
  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a terméket.");
  }
  return response.json();
}

export async function fetchCatalog() {
  const response = await fetch(`${API_BASE}/catalog`);
  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a kalkulátor katalógust.");
  }
  return response.json();
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Nem sikerült elérni a szervert.");
  }
  return response.json();
}

export async function requestQuote(payload) {
  const response = await fetch(`${API_BASE}/price/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Nem sikerült árat számolni.");
  }

  return response.json();
}
