import { useEffect, useState } from "react";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./features/admin/AdminPage";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";

type RouteState =
  | { view: "home" }
  | { view: "admin" }
  | { view: "products" }
  | { view: "product-details"; slug: string };

function resolveRoute(pathname: string): RouteState {
  if (pathname === "/") return { view: "home" };
  if (pathname === "/admin") return { view: "admin" };
  if (pathname === "/products") return { view: "products" };
  if (pathname.startsWith("/products/")) {
    const slug = pathname.replace("/products/", "").trim();
    if (slug) return { view: "product-details", slug };
  }
  return { view: "home" };
}

function App() {
  const [route, setRoute] = useState<RouteState>(() => resolveRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRoute(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(path: string) {
    if (window.location.pathname === path) return;
    window.history.pushState({}, "", path);
    setRoute(resolveRoute(path));
  }

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid #ccc" }}>
        <button onClick={() => navigate("/")}>Kalkulátor</button>
        <button onClick={() => navigate("/products")}>Termékek</button>
        <button onClick={() => navigate("/admin")}>Admin</button>
      </nav>

      {route.view === "home" && <HomePage />}
      {route.view === "admin" && <AdminPage />}
      {route.view === "products" && <Products onOpenProduct={(slug: string) => navigate(`/products/${slug}`)} />}
      {route.view === "product-details" && (
        <ProductDetails slug={route.slug} onBack={() => navigate("/products")} />
      )}
    </div>
  );
}

export default App;
