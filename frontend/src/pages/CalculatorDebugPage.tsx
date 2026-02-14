import { useState } from "react";
import { CalculatorFeature, type CalculatorQuoteSnapshot } from "../features/calculator";
import { useCart } from "../context/CartContext";

function createCartId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CalculatorDebugPage({ onGoCart }: { onGoCart: () => void }) {
  const { addItem } = useCart();
  const [quoteSnapshot, setQuoteSnapshot] = useState<CalculatorQuoteSnapshot | null>(null);
  const [added, setAdded] = useState(false);

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
      <section className="container">
        <header className="header">
          <h1>Kalkulátor (debug)</h1>
          <p className="health">Admin teszt oldal</p>
        </header>

        <CalculatorFeature embedded locked={false} onQuoteChange={setQuoteSnapshot} />

        <div className="cart-inline-actions">
          <button type="button" disabled={!quoteSnapshot} onClick={handleAddToCart}>
            Kosárba
          </button>
          <button type="button" onClick={onGoCart}>
            Ugrás a kosárhoz
          </button>
          {added && <span className="health">Hozzáadva a kosárhoz.</span>}
        </div>
      </section>
    </main>
  );
}
