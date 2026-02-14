// frontend/src/features/admin/components/AnchorCreateForm.tsx
import { useState } from "react";
import type { AnchorCreate } from "../../../types/admin";

type Props = {
  onCreate: (payload: AnchorCreate) => void;
  creating: boolean;
};

export function AnchorCreateForm({ onCreate, creating }: Props) {
  const [product_code, setProduct] = useState("");
  const [material_code, setMaterial] = useState("");
  const [size_key, setSize] = useState("");
  const [anchor_qty, setQty] = useState("100");
  const [anchor_price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("HUF");

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const qtyNum = Number(anchor_qty);
    const priceNum = Number(anchor_price);

    onCreate({
      product_code: product_code.trim(),
      material_code: material_code.trim(),
      size_key: size_key.trim(),
      anchor_qty: qtyNum,
      anchor_price: priceNum,
      currency: currency.trim() || "HUF"
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, alignItems: "end" }}>
      <h2 style={{ margin: 0 }}>Új anchor ár létrehozása</h2>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
        <Field label="Termékkód">
          <input value={product_code} onChange={(e) => setProduct(e.target.value)} disabled={creating} />
        </Field>
        <Field label="Anyagkód">
          <input value={material_code} onChange={(e) => setMaterial(e.target.value)} disabled={creating} />
        </Field>
        <Field label="Méretkulcs">
          <input value={size_key} onChange={(e) => setSize(e.target.value)} disabled={creating} />
        </Field>
        <Field label="Mennyiség">
          <input inputMode="numeric" value={anchor_qty} onChange={(e) => setQty(e.target.value)} disabled={creating} />
        </Field>
        <Field label="Ár (Ft)">
          <input inputMode="decimal" value={anchor_price} onChange={(e) => setPrice(e.target.value)} disabled={creating} />
        </Field>
        <Field label="Pénznem">
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={creating} />
        </Field>
      </div>

      <div>
        <button type="submit" disabled={creating}>
          {creating ? "Betöltés..." : "Létrehozás"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
      <span>{label}</span>
      {children}
    </label>
  );
}
