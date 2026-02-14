export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="admin-pagination">
      <div className="admin-inline-actions">
        <label>
          Oldalméret
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      <div className="admin-inline-actions">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Előző</button>
        <span>{page}. oldal / {pageCount}</span>
        <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Következő</button>
      </div>
    </div>
  );
}
