const API_BASE = "http://127.0.0.1:8001";

function toAbsoluteUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}

async function parseJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (isJson ? body?.detail || body?.message : body) || fallbackMessage;
    const err = new Error(message);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body;
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  return parseJsonResponse(response, "Nem sikerült betölteni a termékeket.");
}

export async function fetchProductBySlug(slug) {
  const response = await fetch(`${API_BASE}/products/${slug}`);
  return parseJsonResponse(response, "Nem sikerült betölteni a terméket.");
}

export async function fetchCatalog() {
  const response = await fetch(`${API_BASE}/catalog`);
  return parseJsonResponse(response, "Nem sikerült betölteni a kalkulátor katalógust.");
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return parseJsonResponse(response, "Nem sikerült elérni a szervert.");
}

export async function requestQuote(payload) {
  const response = await fetch(`${API_BASE}/price/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response, "Nem sikerült árat számolni.");
}

export async function submitQuoteRequest(payload) {
  const response = await fetch(`${API_BASE}/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(response, "Nem sikerült elküldeni az ajánlatkérést.");
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await parseJsonResponse(response, "Nem sikerült feltölteni a fájlt.");
  return { ...data, url: toAbsoluteUrl(data.url) };
}

export async function fetchAnchors(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.product) qs.set("product", params.product);
  if (params.paper) qs.set("paper", params.paper);
  if (params.size) qs.set("size", params.size);
  if (params.qty !== undefined && params.qty !== null && params.qty !== "") qs.set("qty", String(params.qty));
  if (params.q) qs.set("q", params.q);

  const response = await fetch(`${API_BASE}/anchors?${qs.toString()}`);
  return parseJsonResponse(response, "Nem sikerült betölteni az anchor árakat.");
}

export async function createAnchorPrice(payload) {
  const response = await fetch(`${API_BASE}/admin/anchors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, "Nem sikerült létrehozni az anchor árat.");
}

export async function updateAnchorPrice(id, payload) {
  const response = await fetch(`${API_BASE}/admin/anchors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, "Nem sikerült menteni az anchor árat.");
}

export async function deleteAnchorPrice(id) {
  const response = await fetch(`${API_BASE}/admin/anchors/${id}`, {
    method: "DELETE",
  });
  return parseJsonResponse(response, "Nem sikerült törölni az anchor árat.");
}

export async function bulkUpdateAnchorPrices(updates) {
  const response = await fetch(`${API_BASE}/anchors/bulk`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  return parseJsonResponse(response, "Nem sikerült a tömeges mentés.");
}

export async function bulkDeleteAnchorPrices(ids) {
  const response = await fetch(`${API_BASE}/anchors/bulk`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return parseJsonResponse(response, "Nem sikerült a tömeges törlés.");
}

export async function fetchAdminOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  const response = await fetch(`${API_BASE}/admin/orders?${qs.toString()}`);
  return parseJsonResponse(response, "Nem sikerült betölteni a rendeléseket.");
}

export async function fetchAdminOrder(id) {
  const response = await fetch(`${API_BASE}/admin/orders/${id}`);
  return parseJsonResponse(response, "Nem sikerült betölteni a rendelés részleteit.");
}

export async function updateAdminOrder(id, payload) {
  const response = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, "Nem sikerült frissíteni a rendelést.");
}

export async function bulkUpdateAdminOrderStatus(ids, status) {
  const response = await fetch(`${API_BASE}/admin/orders/bulk-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, status }),
  });
  return parseJsonResponse(response, "Nem sikerült a tömeges státuszfrissítés.");
}
