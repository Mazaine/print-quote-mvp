export function AnchorsTable({
  rows,
  selectedIds,
  dirtyMap,
  savingIds,
  deletingIds,
  onToggleSelect,
  onToggleSelectAll,
  onChangeDraftPrice,
  onSaveRow,
  onDeleteRow,
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} /></th>
            <th>ID</th>
            <th>Termék</th>
            <th>Papír</th>
            <th>Méret</th>
            <th>Mennyiség</th>
            <th>Ár (Ft)</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSaving = savingIds.has(row.id);
            const isDeleting = deletingIds.has(row.id);
            const draft = dirtyMap[row.id] ?? row.anchor_price;
            const dirty = dirtyMap[row.id] !== undefined;

            return (
              <tr key={row.id} className={dirty ? "is-dirty" : ""}>
                <td><input type="checkbox" checked={selectedIds.has(row.id)} onChange={(e) => onToggleSelect(row.id, e.target.checked)} /></td>
                <td>{row.id}</td>
                <td>{row.product_code}</td>
                <td>{row.material_code}</td>
                <td>{row.size_key}</td>
                <td>{row.anchor_qty}</td>
                <td>
                  <input
                    className="price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft}
                    onChange={(e) => onChangeDraftPrice(row, e.target.value)}
                  />
                </td>
                <td>
                  <div className="mini-actions">
                    <button type="button" className="mini" disabled={!dirty || isSaving || isDeleting} onClick={() => onSaveRow(row.id)}>
                      {isSaving ? "Mentés..." : "Mentés"}
                    </button>
                    <button type="button" className="mini danger" disabled={isSaving || isDeleting} onClick={() => onDeleteRow(row.id)}>
                      {isDeleting ? "Törlés..." : "Törlés"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={8}><em>Nincs találat</em></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
