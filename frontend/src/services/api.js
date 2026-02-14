const API_BASE = "http://127.0.0.1:8001";

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a termékeket.");
  }

  return response.json();
}
