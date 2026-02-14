import { useEffect, useMemo, useState } from "react";

import { AnchorsTable } from "../components/admin/AnchorsTable.jsx";
import { AdminToolbar } from "../components/admin/AdminToolbar.jsx";
import { CreateAnchorPanel } from "../components/admin/CreateAnchorPanel.jsx";
import { FiltersPanel } from "../components/admin/FiltersPanel.jsx";
import { Pagination } from "../components/admin/Pagination.jsx";
import {
  bulkDeleteAnchorPrices,
  bulkUpdateAnchorPrices,
  createAnchorPrice,
  deleteAnchorPrice,
  fetchAnchors,
  updateAnchorPrice,
} from "../services/api";

function debounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

function filterChips(filters) {
  const labels = {
    product: "Termék",
    paper: "Papír",
    size: "Méret",
    qty: "Mennyiség",
    q: "Keresés",
  };
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ({ key, label: labels[key], value }));
}

export default function AdminAnchors({ onOpenOrders }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [filters, setFilters] = useState({ product: "", paper: "", size: "", qty: "", q: "" });
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = debounce(searchValue, 300);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [dirtyMap, setDirtyMap] = useState({});
  const [savingIds, setSavingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    setFilters((prev) => ({ ...prev, q: debouncedSearch }));
    setPage(1);
  }, [debouncedSearch]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAnchors({
        page,
        pageSize,
        product: filters.product || undefined,
        paper: filters.paper || undefined,
        size: filters.size || undefined,
        qty: filters.qty || undefined,
        q: filters.q || undefined,
      });
      setRows(response.data || []);
      setTotal(response.total || 0);
      setSelectedIds(new Set());
      setDirtyMap({});
    } catch (e) {
      setError(e.message || "Nem sikerült betölteni az anchor árakat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, pageSize, filters.product, filters.paper, filters.size, filters.qty, filters.q]);

  const dirtyEntries = Object.entries(dirtyMap);

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({ product: "", paper: "", size: "", qty: "", q: "" });
    setSearchValue("");
    setPage(1);
  }

  async function createAnchor(payload) {
    setCreating(true);
    setError("");
    setNotice("");
    try {
      await createAnchorPrice(payload);
      setNotice("Anchor ár létrehozva.");
      setCreateOpen(false);
      await loadData();
    } catch (e) {
      setError(e.message || "Nem sikerült létrehozni az anchor árat.");
    } finally {
      setCreating(false);
    }
  }

  function onChangeDraftPrice(row, nextValue) {
    const num = Number(nextValue);
    if (!Number.isFinite(num) || num < 0) return;

    setDirtyMap((prev) => {
      const next = { ...prev };
      if (num === row.anchor_price) {
        delete next[row.id];
      } else {
        next[row.id] = num;
      }
      return next;
    });
  }

  async function saveRow(id) {
    const price = dirtyMap[id];
    if (price === undefined) return;

    setSavingIds((prev) => new Set(prev).add(id));
    setError("");
    try {
      await updateAnchorPrice(id, { anchor_price: price });
      await loadData();
      setNotice("Sikeres mentés.");
    } catch (e) {
      setError(e.message || "Mentési hiba.");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function deleteRow(id) {
    setDeletingIds((prev) => new Set(prev).add(id));
    setError("");
    try {
      await deleteAnchorPrice(id);
      await loadData();
      setNotice("Sor törölve.");
    } catch (e) {
      setError(e.message || "Törlési hiba.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function saveAllDirty() {
    if (!dirtyEntries.length) return;
    setError("");
    try {
      await bulkUpdateAnchorPrices(
        dirtyEntries.map(([id, priceFt]) => ({ id: Number(id), priceFt: Number(priceFt) }))
      );
      await loadData();
      setNotice(`${dirtyEntries.length} módosítás mentve.`);
    } catch (e) {
      setError(e.message || "Tömeges mentési hiba.");
    }
  }

  async function deleteSelected() {
    if (!selectedIds.size) return;
    setError("");
    try {
      await bulkDeleteAnchorPrices(Array.from(selectedIds));
      await loadData();
      setNotice("Kijelölt sorok törölve.");
    } catch (e) {
      setError(e.message || "Tömeges törlési hiba.");
    }
  }

  const chips = useMemo(() => filterChips(filters), [filters]);

  return (
    <main className="admin-page">
      <section className="admin-wrapper">
        <AdminToolbar title="Anchor árak" searchValue={searchValue} onSearchChange={setSearchValue}>
          <button type="button" onClick={onOpenOrders}>Rendelések</button>
        </AdminToolbar>

        <FiltersPanel
          open={isFiltersOpen}
          onToggle={() => setFiltersOpen((prev) => !prev)}
          filters={filters}
          onChange={setFilter}
          onReset={resetFilters}
          onApply={() => setPage(1)}
        />

        <CreateAnchorPanel
          open={isCreateOpen}
          onToggle={() => setCreateOpen((prev) => !prev)}
          creating={creating}
          onCreate={createAnchor}
        />

        {chips.length > 0 && (
          <div className="active-chips">
            {chips.map((chip) => (
              <button key={chip.key} type="button" className="chip" onClick={() => setFilter(chip.key, "")}> 
                {chip.label}: {String(chip.value)} ✕
              </button>
            ))}
          </div>
        )}

        {dirtyEntries.length > 0 && (
          <div className="save-bar">
            <span>{dirtyEntries.length} módosítás</span>
            <div className="admin-inline-actions">
              <button type="button" onClick={saveAllDirty}>Összes mentése</button>
              <button type="button" onClick={() => setDirtyMap({})}>Visszavonás</button>
            </div>
          </div>
        )}

        <section className="admin-card">
          <div className="admin-inline-actions" style={{ justifyContent: "space-between" }}>
            <strong>Anchor lista</strong>
            <button type="button" disabled={!selectedIds.size} onClick={deleteSelected}>Kijelöltek törlése</button>
          </div>

          {loading && <p>Betöltés...</p>}
          {error && <p className="error">{error}</p>}
          {notice && <p className="success">{notice}</p>}

          <AnchorsTable
            rows={rows}
            selectedIds={selectedIds}
            dirtyMap={dirtyMap}
            savingIds={savingIds}
            deletingIds={deletingIds}
            onToggleSelect={(id, checked) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (checked) next.add(id);
                else next.delete(id);
                return next;
              });
            }}
            onToggleSelectAll={(checked) => {
              if (!checked) {
                setSelectedIds(new Set());
                return;
              }
              setSelectedIds(new Set(rows.map((row) => row.id)));
            }}
            onChangeDraftPrice={onChangeDraftPrice}
            onSaveRow={saveRow}
            onDeleteRow={deleteRow}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </section>
      </section>
    </main>
  );
}
