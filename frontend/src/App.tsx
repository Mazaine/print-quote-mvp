import { useEffect, useState } from "react";
import { AdminPage } from "./features/admin/AdminPage";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import { CalculatorDebugPage } from "./pages/CalculatorDebugPage";
import { CartPage } from "./pages/CartPage";
import QuotePage from "./pages/Quote.jsx";
import { ADMIN_DEBUG } from "./config";
import { useCart } from "./context/CartContext";

type RouteState =
  | { view: "products" }
  | { view: "admin" }
  | { view: "calculator-debug" }
  | { view: "product-details"; slug: string }
  | { view: "cart" }
  | { view: "quote" };

function resolveRoute(pathname: string): RouteState {
  if (pathname === "/" || pathname === "/products") return { view: "products" };
  if (pathname === "/admin") return { view: "admin" };
  if (pathname === "/calculator") return { view: "calculator-debug" };
  if (pathname === "/cart") return { view: "cart" };
  if (pathname === "/quote") return { view: "quote" };
  if (pathname.startsWith("/products/")) {
    const slug = pathname.replace("/products/", "").trim();
    if (slug) return { view: "product-details", slug };
  }
  return { view: "products" };
}

function App() {
  const { itemCount } = useCart();
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

  useEffect(() => {
    if (route.view === "calculator-debug" && !ADMIN_DEBUG) {
      navigate("/products");
    }
  }, [route.view]);

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid #ccc" }}>
        <button onClick={() => navigate("/products")}>Termékek</button>
        <button onClick={() => navigate("/cart")}>Kosár ({itemCount})</button>
        {ADMIN_DEBUG && <button onClick={() => navigate("/calculator")}>Kalkulátor (debug)</button>}
        <button onClick={() => navigate("/admin")}>Admin</button>
      </nav>

      {route.view === "products" && <Products onOpenProduct={(slug: string) => navigate(`/products/${slug}`)} />}
      {route.view === "admin" && <AdminPage />}
      {route.view === "calculator-debug" && ADMIN_DEBUG && <CalculatorDebugPage onGoCart={() => navigate("/cart")} />}
      {route.view === "cart" && (
        <CartPage onGoProducts={() => navigate("/products")} onGoQuote={() => navigate("/quote")} />
      )}
      {route.view === "quote" && <QuotePage onGoProducts={() => navigate("/products")} />}
      {route.view === "product-details" && (
        <ProductDetails slug={route.slug} onBack={() => navigate("/products")} onGoCart={() => navigate("/cart")} />
      )}
    </div>
  );
}

export default App;
