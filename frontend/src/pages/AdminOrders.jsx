import { useEffect, useState } from "react";

import { AdminToolbar } from "../components/admin/AdminToolbar.jsx";
import { OrdersTable } from "../components/admin/OrdersTable.jsx";
import { Pagination } from "../components/admin/Pagination.jsx";
import { bulkUpdateAdminOrderStatus, fetchAdminOrders, updateAdminOrder } from "../services/api";

const STATUS_OPTIONS = ["", "Beérkezett", "Gyártás alatt", "Kész", "Átadva", "Elutasítva"];

function debounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export default function AdminOrders({ onOpenAnchors, onOpenDetails }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = debounce(searchValue, 300);

  const [draftStatus, setDraftStatus] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [savingIds, setSavingIds] = useState(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminOrders({
        page,
        pageSize,
        status: statusFilter || undefined,
        q: debouncedSearch || undefined,
      });
      setRows(response.data || []);
      setTotal(response.total || 0);
      setSelectedIds(new Set());
      setDraftStatus({});
    } catch (e) {
      setError(e.message || "Nem sikerült betölteni a rendeléseket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, pageSize, statusFilter, debouncedSearch]);

  async function saveRow(orderId) {
    const nextStatus = draftStatus[orderId];
    const current = rows.find((row) => row.id === orderId)?.status;
    if (!nextStatus || nextStatus === current) return;

    setSavingIds((prev) => new Set(prev).add(orderId));
    setError("");
    try {
      await updateAdminOrder(orderId, { status: nextStatus });
      await loadData();
      setNotice("Státusz mentve.");
    } catch (e) {
      setError(e.message || "Nem sikerült a státusz mentése.");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  async function saveBulkStatus(status) {
    if (!selectedIds.size || !status) return;
    setError("");
    try {
      await bulkUpdateAdminOrderStatus(Array.from(selectedIds), status);
      await loadData();
      setNotice("Kijelölt rendelések státusza frissítve.");
    } catch (e) {
      setError(e.message || "Tömeges státuszfrissítési hiba.");
    }
  }

  const selectedCount = selectedIds.size;

  return (
    <main className="admin-page">
      <section className="admin-wrapper">
        <AdminToolbar title="Rendelések / Ajánlatok" searchValue={searchValue} onSearchChange={setSearchValue}>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((status) => (
              <option key={status || "all"} value={status}>{status || "Összes státusz"}</option>
            ))}
          </select>
          <button type="button" onClick={onOpenAnchors}>Anchor árak</button>
        </AdminToolbar>

        <section className="admin-card">
          <div className="admin-inline-actions" style={{ justifyContent: "space-between" }}>
            <strong>Lista</strong>
            <div className="admin-inline-actions">
              <span>{selectedCount} kijelölve</span>
              <select defaultValue="" onChange={(e) => saveBulkStatus(e.target.value)}>
                <option value="">Bulk státusz...</option>
                {STATUS_OPTIONS.filter(Boolean).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && <p>Betöltés...</p>}
          {error && <p className="error">{error}</p>}
          {notice && <p className="success">{notice}</p>}

          <OrdersTable
            rows={rows}
            selectedIds={selectedIds}
            draftStatus={draftStatus}
            savingIds={savingIds}
            onToggleSelect={(id, checked) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (checked) next.add(id);
                else next.delete(id);
                return next;
              });
            }}
            onToggleAll={(checked) => {
              if (!checked) {
                setSelectedIds(new Set());
                return;
              }
              setSelectedIds(new Set(rows.map((row) => row.id)));
            }}
            onDraftStatus={(id, status) => setDraftStatus((prev) => ({ ...prev, [id]: status }))}
            onSaveRow={saveRow}
            onOpen={onOpenDetails}
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
