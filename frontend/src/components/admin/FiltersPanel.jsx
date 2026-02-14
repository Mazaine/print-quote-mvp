export function FiltersPanel({ open, onToggle, filters, onChange, onReset, onApply }) {
  return (
    <section className="admin-panel">
      <button className="admin-toggle" type="button" onClick={onToggle}>
        {open ? "Szűrők elrejtése" : "Szűrők megjelenítése"}
      </button>

      {open && (
        <div className="admin-panel-body">
          <div className="admin-grid admin-grid-4">
            <label>
              <span>Termék</span>
              <input value={filters.product ?? ""} onChange={(e) => onChange("product", e.target.value)} />
            </label>
            <label>
              <span>Papír</span>
              <input value={filters.paper ?? ""} onChange={(e) => onChange("paper", e.target.value)} />
            </label>
            <label>
              <span>Méret</span>
              <input value={filters.size ?? ""} onChange={(e) => onChange("size", e.target.value)} />
            </label>
            <label>
              <span>Mennyiség</span>
              <input value={filters.qty ?? ""} onChange={(e) => onChange("qty", e.target.value)} />
            </label>
          </div>
          <div className="admin-inline-actions">
            <button type="button" onClick={onApply}>Szűrés</button>
            <button type="button" onClick={onReset}>Szűrők törlése</button>
          </div>
        </div>
      )}
    </section>
  );
}
