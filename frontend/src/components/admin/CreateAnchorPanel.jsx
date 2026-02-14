import { useState } from "react";

export function CreateAnchorPanel({ open, onToggle, creating, onCreate }) {
  const [form, setForm] = useState({
    product_code: "",
    material_code: "",
    size_key: "",
    anchor_qty: "100",
    anchor_price: "0",
    currency: "HUF",
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onCreate({
      product_code: form.product_code.trim(),
      material_code: form.material_code.trim(),
      size_key: form.size_key.trim(),
      anchor_qty: Number(form.anchor_qty),
      anchor_price: Number(form.anchor_price),
      currency: form.currency.trim() || "HUF",
    });
  }

  return (
    <section className="admin-panel">
      <button className="admin-toggle" type="button" onClick={onToggle}>
        {open ? "Új anchor ár elrejtése" : "+ Új anchor ár"}
      </button>

      {open && (
        <form className="admin-panel-body" onSubmit={submit}>
          <div className="admin-grid admin-grid-6">
            <label><span>Termék</span><input value={form.product_code} onChange={(e) => update("product_code", e.target.value)} /></label>
            <label><span>Papír</span><input value={form.material_code} onChange={(e) => update("material_code", e.target.value)} /></label>
            <label><span>Méret</span><input value={form.size_key} onChange={(e) => update("size_key", e.target.value)} /></label>
            <label><span>Mennyiség</span><input value={form.anchor_qty} onChange={(e) => update("anchor_qty", e.target.value)} /></label>
            <label><span>Ár (Ft)</span><input value={form.anchor_price} onChange={(e) => update("anchor_price", e.target.value)} /></label>
            <label><span>Pénznem</span><input value={form.currency} onChange={(e) => update("currency", e.target.value)} /></label>
          </div>
          <div className="admin-inline-actions">
            <button type="submit" disabled={creating}>{creating ? "Létrehozás..." : "Létrehozás"}</button>
          </div>
        </form>
      )}
    </section>
  );
}
