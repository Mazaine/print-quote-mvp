import { useEffect, useState } from "react";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import { CalculatorDebugPage } from "./pages/CalculatorDebugPage";
import { CartPage } from "./pages/CartPage";
import QuotePage from "./pages/Quote.jsx";
import UsageGuide from "./pages/UsageGuide.jsx";
import AdminAnchors from "./pages/AdminAnchors.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminOrderDetails from "./pages/AdminOrderDetails.jsx";
import { ADMIN_DEBUG } from "./config";
import { useCart } from "./context/CartContext";

type RouteState =
  | { view: "products" }
  | { view: "calculator-debug" }
  | { view: "product-details"; slug: string }
  | { view: "cart" }
  | { view: "quote" }
  | { view: "guide" }
  | { view: "admin-anchors" }
  | { view: "admin-orders" }
  | { view: "admin-order-details"; id: string };

function resolveRoute(pathname: string): RouteState {
  if (pathname === "/" || pathname === "/products") return { view: "products" };
  if (pathname === "/calculator") return { view: "calculator-debug" };
  if (pathname === "/cart") return { view: "cart" };
  if (pathname === "/quote") return { view: "quote" };
  if (pathname === "/utmutato") return { view: "guide" };
  if (pathname === "/admin" || pathname === "/admin/anchors") return { view: "admin-anchors" };
  if (pathname === "/admin/orders") return { view: "admin-orders" };
  if (pathname.startsWith("/admin/orders/")) {
    const id = pathname.replace("/admin/orders/", "").trim();
    if (id) return { view: "admin-order-details", id };
  }
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
        <button onClick={() => navigate("/utmutato")}>Használati útmutató</button>
        <button onClick={() => navigate("/cart")}>Kosár ({itemCount})</button>
        {ADMIN_DEBUG && <button onClick={() => navigate("/calculator")}>Kalkulátor (debug)</button>}
        <button onClick={() => navigate("/admin")}>Admin</button>
      </nav>

      {route.view === "products" && <Products onOpenProduct={(slug: string) => navigate(`/products/${slug}`)} />}
      {route.view === "calculator-debug" && ADMIN_DEBUG && <CalculatorDebugPage onGoCart={() => navigate("/cart")} />}
      {route.view === "cart" && <CartPage onGoProducts={() => navigate("/products")} onGoQuote={() => navigate("/quote")} />}
      {route.view === "quote" && <QuotePage onGoProducts={() => navigate("/products")} />}
      {route.view === "guide" && <UsageGuide />}
      {route.view === "admin-anchors" && <AdminAnchors onOpenOrders={() => navigate("/admin/orders")} />}
      {route.view === "admin-orders" && (
        <AdminOrders
          onOpenAnchors={() => navigate("/admin/anchors")}
          onOpenDetails={(id: string) => navigate(`/admin/orders/${id}`)}
        />
      )}
      {route.view === "admin-order-details" && (
        <AdminOrderDetails orderId={route.id} onBack={() => navigate("/admin/orders")} />
      )}
      {route.view === "product-details" && (
        <ProductDetails slug={route.slug} onBack={() => navigate("/products")} onGoCart={() => navigate("/cart")} />
      )}
    </div>
  );
}

export default App;
