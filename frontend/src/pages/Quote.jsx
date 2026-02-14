import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { submitQuoteRequest } from "../services/api";

function formatHuf(value) {
  return `${value.toLocaleString("hu-HU")} Ft`;
}

function formatSelections(selections) {
  const labels = [];
  if (selections.size) labels.push(`Méret: ${selections.size}`);
  if (selections.paper) labels.push(`Papír: ${selections.paper}`);
  if (selections.color) labels.push(`Szín: ${selections.color}`);
  if (typeof selections.quantity === "number") labels.push(`Mennyiség: ${selections.quantity}`);
  if (selections.extras?.length) labels.push(`Extrák: ${selections.extras.join(", ")}`);
  return labels.join(" | ");
}

export default function QuotePage({ onGoProducts }) {
  const { items, subtotalFt, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    deadline: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasItems = items.length > 0;
  const isFormValid = form.name.trim() && form.email.trim() && form.phone.trim();

  const canSubmit = useMemo(() => hasItems && isFormValid && !loading, [hasItems, isFormValid, loading]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company || null,
          deadline: form.deadline || null,
          note: form.note || null,
        },
        items,
        totalFt: subtotalFt,
        createdAt: new Date().toISOString(),
      };

      const response = await submitQuoteRequest(payload);
      setSuccess(`${response.message} (#${response.id})`);
      clearCart();
      window.setTimeout(() => onGoProducts(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült elküldeni az ajánlatkérést.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="container cart-container">
        <header className="header">
          <h1>Ajánlatkérés</h1>
          <p className="health">Kosár összesítés és megrendelő adatok</p>
        </header>

        {!hasItems && (
          <div className="cart-empty">
            <p>A kosár üres, nincs mit elküldeni.</p>
            <button type="button" onClick={onGoProducts}>
              Vissza a termékekhez
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
                    <p className="cart-item-price">{formatHuf(item.lineTotalFt)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <strong>Végösszeg: {formatHuf(subtotalFt)}</strong>
            </div>

            <form className="quote-form" onSubmit={onSubmit}>
              <label>
                <span>Név *</span>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              </label>

              <label>
                <span>Email *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Telefonszám *</span>
                <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required />
              </label>

              <label>
                <span>Cégnév</span>
                <input value={form.company} onChange={(e) => updateField("company", e.target.value)} />
              </label>

              <label>
                <span>Határidő</span>
                <input value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} />
              </label>

              <label className="quote-note">
                <span>Megjegyzés</span>
                <textarea value={form.note} onChange={(e) => updateField("note", e.target.value)} rows={4} />
              </label>

              <div className="cart-inline-actions">
                <button type="submit" disabled={!canSubmit}>
                  {loading ? "Küldés..." : "Ajánlatkérés elküldése"}
                </button>
                <button type="button" onClick={onGoProducts}>
                  Mégsem
                </button>
              </div>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
            </form>
          </>
        )}
      </section>
    </main>
  );
}
