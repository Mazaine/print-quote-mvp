// frontend/src/types/admin.ts
export type AnchorRead = {
  id: number;
  product_code: string;
  material_code: string;
  size_key: string;
  anchor_qty: number;
  anchor_price: number;
  currency: string;
  created_at: string; // ISO
};

export type AnchorCreate = {
  product_code: string;
  material_code: string;
  size_key: string;
  anchor_qty: number;
  anchor_price: number;
  currency?: string; // default HUF backend
};

export type AnchorUpdate = Partial<{
  product_code: string;
  material_code: string;
  size_key: string;
  anchor_qty: number;
  anchor_price: number;
  currency: string;
}>;

export type AnchorFilters = Partial<{
  product_code: string;
  material_code: string;
  size_key: string;
  anchor_qty: number;
}>;
