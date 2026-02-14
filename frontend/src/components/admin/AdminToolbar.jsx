export function AdminToolbar({ title, searchValue, onSearchChange, children }) {
  return (
    <header className="admin-toolbar">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="admin-toolbar-right">
        <input
          className="admin-search"
          placeholder="Keresés..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {children}
      </div>
    </header>
  );
}
