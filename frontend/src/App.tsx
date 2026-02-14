import { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./features/admin/AdminPage";

function App() {
  const [view, setView] = useState<"home" | "admin">("home");

  return (
    <div>
      <nav style={{display: "flex", gap: 8,padding: 12, borderBottom: "1px solid #ccc" }}>
        <button onClick={() => setView("home")}>Calculator</button>
        <button onClick={() => setView("admin")}>Admin</button>
      </nav>
      {view === "home" ? <HomePage /> : <AdminPage />}
    </div>
  );
}

export default App;
