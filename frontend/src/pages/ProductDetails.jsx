import { useEffect, useState } from "react";

import { CalculatorFeature } from "../features/calculator";
import { fetchProductBySlug } from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80";

export default function ProductDetails({ slug, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

            <CalculatorFeature embedded initialProductSlug={product.slug} />
          </>
        )}
      </section>
    </main>
  );
}
