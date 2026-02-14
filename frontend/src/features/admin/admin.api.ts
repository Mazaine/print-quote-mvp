// frontend/src/features/admin/admin.api.ts
import { http } from "../../api/http";
import type { AnchorCreate, AnchorFilters, AnchorRead, AnchorUpdate } from "../../types/admin";

function toQuery(filters?: AnchorFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.product_code) params.set("product_code", filters.product_code);
  if (filters.material_code) params.set("material_code", filters.material_code);
  if (filters.size_key) params.set("size_key", filters.size_key);
  if (typeof filters.anchor_qty === "number") {
    params.set("anchor_qty", String(filters.anchor_qty));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: any = new Error(
      data?.detail || res.statusText || "Request failed"
    );
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data as T;
}

export async function listAnchors(filters?: AnchorFilters): Promise<AnchorRead[]> {
  const res = await http(`/admin/anchors${toQuery(filters)}`);
  return parseJson<AnchorRead[]>(res);
}

export async function createAnchor(payload: AnchorCreate): Promise<AnchorRead> {
  const res = await http(`/admin/anchors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<AnchorRead>(res);
}

export async function updateAnchor(
  id: number,
  patch: AnchorUpdate
): Promise<AnchorRead> {
  const res = await http(`/admin/anchors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJson<AnchorRead>(res);
}

export async function deleteAnchor(
  id: number
): Promise<{ ok: boolean }> {
  const res = await http(`/admin/anchors/${id}`, {
    method: "DELETE",
  });
  return parseJson<{ ok: boolean }>(res);
}
