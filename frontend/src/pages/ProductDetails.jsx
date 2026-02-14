import { useEffect, useState } from "react";

import { CalculatorFeature } from "../features/calculator";
import { fetchProductBySlug } from "../services/api";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80";

function createCartId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ProductDetails({ slug, onBack, onGoCart }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteSnapshot, setQuoteSnapshot] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProductBySlug(slug);
        if (mounted) {
          setProduct(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Nem sikerült betölteni a terméket.");
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  function handleAddToCart() {
    if (!quoteSnapshot) return;

    addItem({
      id: createCartId(),
      productSlug: quoteSnapshot.productSlug,
      productName: quoteSnapshot.productName,
      productImageUrl: quoteSnapshot.productImageUrl,
      selections: quoteSnapshot.selections,
      unitPriceFt: quoteSnapshot.priceFt,
      lineTotalFt: quoteSnapshot.priceFt,
      createdAt: new Date().toISOString(),
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="page">
      <section className="container product-details-container">
        <button className="back-button" onClick={onBack}>
          Vissza a termékekhez
        </button>

        {loading && <p>Betöltés...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && product && (
          <>
            <img
              className="product-details-image"
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={product.name}
              onError={(event) => {
                if (event.currentTarget.dataset.fallback === "1") return;
                event.currentTarget.src = FALLBACK_IMAGE;
                event.currentTarget.dataset.fallback = "1";
              }}
            />
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            <p className="product-price">{product.basePrice.toLocaleString("hu-HU")} Ft-tól</p>

            <CalculatorFeature
              embedded
              initialProductSlug={product.slug}
              locked={true}
              onQuoteChange={setQuoteSnapshot}
            />

            <div className="cart-inline-actions">
              <button type="button" disabled={!quoteSnapshot} onClick={handleAddToCart}>
                Kosárba
              </button>
              <button type="button" onClick={onGoCart}>
                Ugrás a kosárhoz
              </button>
              {added && <span className="health">Hozzáadva a kosárhoz.</span>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
