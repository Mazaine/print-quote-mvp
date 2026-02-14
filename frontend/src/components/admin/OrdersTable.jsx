const STATUS_OPTIONS = ["Beérkezett", "Gyártás alatt", "Kész", "Átadva", "Elutasítva"];

export function OrdersTable({
  rows,
  selectedIds,
  draftStatus,
  savingIds,
  onToggleSelect,
  onToggleAll,
  onDraftStatus,
  onSaveRow,
  onOpen,
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={allSelected} onChange={(e) => onToggleAll(e.target.checked)} /></th>
            <th>Dátum</th>
            <th>Név</th>
            <th>Email</th>
            <th>Összeg</th>
            <th>Státusz</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const currentStatus = draftStatus[row.id] ?? row.status;
            const dirty = currentStatus !== row.status;
            const saving = savingIds.has(row.id);

            return (
              <tr key={row.id} className={dirty ? "is-dirty" : ""}>
                <td><input type="checkbox" checked={selectedIds.has(row.id)} onChange={(e) => onToggleSelect(row.id, e.target.checked)} /></td>
                <td>{new Date(row.createdAt).toLocaleString("hu-HU")}</td>
                <td>{row.customer?.name || "-"}</td>
                <td>{row.customer?.email || "-"}</td>
                <td>{Number(row.totalFt || 0).toLocaleString("hu-HU")} Ft</td>
                <td>
                  <select value={currentStatus} onChange={(e) => onDraftStatus(row.id, e.target.value)}>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td>
                  <div className="mini-actions">
                    <button type="button" className="mini" onClick={() => onOpen(row.id)}>Megnyitás</button>
                    <button type="button" className="mini" disabled={!dirty || saving} onClick={() => onSaveRow(row.id)}>
                      {saving ? "Mentés..." : "Mentés"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7}><em>Nincs találat</em></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
