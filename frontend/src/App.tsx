import { useEffect, useState } from "react";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./features/admin/AdminPage";
import Products from "./pages/Products.jsx";

type RoutePath = "/" | "/admin" | "/products";

function resolvePath(pathname: string): RoutePath {
  if (pathname === "/admin") return "/admin";
  if (pathname === "/products") return "/products";
  return "/";
}

function App() {
  const [path, setPath] = useState<RoutePath>(() => resolvePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setPath(resolvePath(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(next: RoutePath) {
    if (next === path) return;
    window.history.pushState({}, "", next);
    setPath(next);
  }

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid #ccc" }}>
        <button onClick={() => navigate("/")}>Kalkulátor</button>
        <button onClick={() => navigate("/products")}>Termékek</button>
        <button onClick={() => navigate("/admin")}>Admin</button>
      </nav>
      {path === "/" && <HomePage />}
      {path === "/products" && <Products />}
      {path === "/admin" && <AdminPage />}
    </div>
  );
}

export default App;
