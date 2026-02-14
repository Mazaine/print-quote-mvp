// frontend/src/features/admin/AdminPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { AnchorCreate, AnchorFilters, AnchorRead } from "../../types/admin";
import { createAnchor, deleteAnchor, listAnchors, updateAnchor } from "./admin.api";
import { AnchorCreateForm } from "./components/AnchorCreateForm";
import { AnchorTable } from "./components/AnchorTable";

type UiError = { status?: number; message: string };

function mapErrorMessage(status?: number): string {
  if (status === 409) return "Ilyen anchor ár már létezik.";
  if (status === 400) return "Érvénytelen adat.";
  if (status === 422) return "Hiányzó vagy hibás mező.";
  return "Váratlan hiba történt.";
}

function asUiError(e: any): UiError {
  const status = e?.status;
  return {
    status,
    message: mapErrorMessage(status)
  };
}

export function AdminPage() {
  const [items, setItems] = useState<AnchorRead[]>([]);
  const [filters, setFilters] = useState<AnchorFilters>({});
  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const [error, setError] = useState<UiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const count = useMemo(() => items.length, [items]);

  async function load(next?: AnchorFilters) {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await listAnchors(next ?? filters);
      setItems(data);
    } catch (e: any) {
      setError(asUiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(payload: AnchorCreate) {
    setCreating(true);
    setError(null);
    setNotice(null);

    if (!payload.product_code || !payload.material_code || !payload.size_key) {
      setError({ status: 400, message: "Érvénytelen adat." });
      setCreating(false);
      return;
    }
    if (!Number.isFinite(payload.anchor_qty) || payload.anchor_qty < 1) {
      setError({ status: 422, message: "Hiányzó vagy hibás mező." });
      setCreating(false);
      return;
    }
    if (!Number.isFinite(payload.anchor_price) || payload.anchor_price < 0) {
      setError({ status: 422, message: "Hiányzó vagy hibás mező." });
      setCreating(false);
      return;
    }

    try {
      await createAnchor(payload);
      setNotice("Létrehozva.");
      await load(filters);
    } catch (e: any) {
      setError(asUiError(e));
    } finally {
      setCreating(false);
    }
  }

  async function onSavePrice(id: number, newPrice: number) {
    setError(null);
    setNotice(null);
    setSavingIds((s) => new Set(s).add(id));
    try {
      await updateAnchor(id, { anchor_price: newPrice });
      setNotice("Mentve.");
      await load(filters);
    } catch (e: any) {
      setError(asUiError(e));
    } finally {
      setSavingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function onDelete(id: number) {
    const ok = window.confirm("Biztosan törlöd ezt az anchor árat?");
    if (!ok) return;

    setError(null);
    setNotice(null);
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteAnchor(id);
      setNotice("Törölve.");
      await load(filters);
    } catch (e: any) {
      setError(asUiError(e));
    } finally {
      setDeletingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <main style={{ padding: 16, display: "grid", gap: 14 }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Admin felület</h1>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Sorok: {count}</div>
      </header>

      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Anchor árak kezelése</h2>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          <input
            placeholder="Termékkód"
            value={filters.product_code ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, product_code: e.target.value || undefined }))}
          />
          <input
            placeholder="Anyagkód"
            value={filters.material_code ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, material_code: e.target.value || undefined }))}
          />
          <input
            placeholder="Méretkulcs"
            value={filters.size_key ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, size_key: e.target.value || undefined }))}
          />
          <input
            placeholder="Mennyiség"
            inputMode="numeric"
            value={filters.anchor_qty ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              setFilters((f) => ({ ...f, anchor_qty: v ? Number(v) : undefined }));
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => load(filters)} disabled={loading}>
            {loading ? "Betöltés..." : "Szűrés"}
          </button>
          <button
            onClick={() => {
              setFilters({});
              load({});
            }}
            disabled={loading}
          >
            Mégse
          </button>
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <AnchorCreateForm onCreate={onCreate} creating={creating} />
      </section>

      {(error || notice) && (
        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          {notice && <div style={{ color: "green" }}>{notice}</div>}
          {error && (
            <div style={{ color: "crimson" }}>
              <strong>Hiba</strong>
              {typeof error.status === "number" ? ` (${error.status})` : ""}: {error.message}
            </div>
          )}
        </section>
      )}

      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <AnchorTable
          items={items}
          savingIds={savingIds}
          deletingIds={deletingIds}
          onSavePrice={onSavePrice}
          onDelete={onDelete}
        />
      </section>
    </main>
  );
}
