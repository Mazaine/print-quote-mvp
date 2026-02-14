import { useMemo } from "react";
import { useCart } from "../context/CartContext";

interface CartPageProps {
  onGoProducts: () => void;
  onGoQuote: () => void;
}

function formatHuf(value: number) {
  return `${value.toLocaleString("hu-HU")} Ft`;
}

function formatSelections(selections: {
  size?: string;
  paper?: string;
  color?: string;
  quantity?: number;
  extras?: string[];
}) {
  const labels: string[] = [];
  if (selections.size) labels.push(`Méret: ${selections.size}`);
  if (selections.paper) labels.push(`Papír: ${selections.paper}`);
  if (selections.color) labels.push(`Szín: ${selections.color}`);
  if (typeof selections.quantity === "number") labels.push(`Mennyiség: ${selections.quantity}`);
  if (selections.extras?.length) labels.push(`Extrák: ${selections.extras.join(", ")}`);
  return labels.join(" | ");
}

export function CartPage({ onGoProducts, onGoQuote }: CartPageProps) {
  const { items, subtotalFt, removeItem, clearCart } = useCart();

  const hasItems = items.length > 0;

  const title = useMemo(() => `Kosár (${items.length})`, [items.length]);

  return (
    <main className="page">
      <section className="container cart-container">
        <header className="header">
          <h1>{title}</h1>
          {hasItems && (
            <div className="cart-inline-actions">
              <button type="button" onClick={onGoQuote}>
                Ajánlatkérés
              </button>
              <button type="button" onClick={clearCart}>
                Kosár ürítése
              </button>
            </div>
          )}
        </header>

        {!hasItems && (
          <div className="cart-empty">
            <p>A kosár üres.</p>
            <button type="button" onClick={onGoProducts}>
              Tovább a termékekhez
            </button>
          </div>
        )}

        {hasItems && (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <img className="cart-item-image" src={item.productImageUrl} alt={item.productName} />
                  <div className="cart-item-content">
                    <h3>{item.productName}</h3>
                    <p className="cart-item-options">{formatSelections(item.selections)}</p>
                    {item.upload && (
                      <p className="cart-item-file">
                        Fájl: {item.upload.originalName} ({Math.round(item.upload.size / 1024)} KB) -{" "}
                        <a href={item.upload.url} target="_blank" rel="noreferrer">
                          Megnyitás
                        </a>
                      </p>
                    )}
                    <p className="cart-item-price">{formatHuf(item.lineTotalFt)}</p>
                    <button type="button" onClick={() => removeItem(item.id)}>
                      Törlés
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <strong>Végösszeg: {formatHuf(subtotalFt)}</strong>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
