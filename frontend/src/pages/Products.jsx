import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../services/api";

export default function Products({ onOpenProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProducts();
        if (mounted) {
          setProducts(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Hiba történt a betöltéskor.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="page">
      <section className="container">
        <header className="header">
          <h1>Termékek</h1>
          <p className="health">Nyomdai termékkatalógus</p>
        </header>

        {loading && <p>Betöltés...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <section className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={(slug) => {
                  if (typeof onOpenProduct === "function") {
                    onOpenProduct(slug);
                  }
                }}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
