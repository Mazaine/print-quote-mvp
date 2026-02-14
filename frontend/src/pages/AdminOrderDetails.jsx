import { useEffect, useState } from "react";
import { fetchAdminOrder, updateAdminOrder } from "../services/api";

const STATUS_OPTIONS = ["Beérkezett", "Gyártás alatt", "Kész", "Átadva", "Elutasítva"];

function formatSelections(selections = {}) {
  const labels = [];
  if (selections.size) labels.push(`Méret: ${selections.size}`);
  if (selections.paper) labels.push(`Papír: ${selections.paper}`);
  if (selections.color) labels.push(`Szín: ${selections.color}`);
  if (selections.quantity) labels.push(`Mennyiség: ${selections.quantity}`);
  if (selections.extras?.length) labels.push(`Extrák: ${selections.extras.join(", ")}`);
  return labels.join(" | ");
}

export default function AdminOrderDetails({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("Beérkezett");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminOrder(orderId);
      setOrder(response);
      setStatus(response.status || "Beérkezett");
      setAdminNote(response.adminNote || "");
    } catch (e) {
      setError(e.message || "Nem sikerült betölteni a rendelést.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [orderId]);

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await updateAdminOrder(orderId, { status, adminNote });
      setOrder(response);
      setNotice("Rendelés frissítve.");
    } catch (e) {
      setError(e.message || "Nem sikerült menteni.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-wrapper">
        <section className="admin-card">
          <div className="admin-inline-actions" style={{ justifyContent: "space-between" }}>
            <h1>Rendelés részletei</h1>
            <button type="button" onClick={onBack}>Vissza</button>
          </div>

          {loading && <p>Betöltés...</p>}
          {error && <p className="error">{error}</p>}

          {order && (
            <>
              <p><strong>Azonosító:</strong> {order.id}</p>
              <p><strong>Dátum:</strong> {new Date(order.createdAt).toLocaleString("hu-HU")}</p>
              <p><strong>Név:</strong> {order.customer?.name}</p>
              <p><strong>Email:</strong> {order.customer?.email}</p>
              <p><strong>Telefon:</strong> {order.customer?.phone}</p>
              <p><strong>Végösszeg:</strong> {Number(order.totalFt || 0).toLocaleString("hu-HU")} Ft</p>

              <div className="admin-grid admin-grid-2">
                <label>
                  <span>Státusz</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Admin megjegyzés</span>
                  <input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                </label>
              </div>

              <div className="admin-inline-actions">
                <button type="button" disabled={saving} onClick={save}>{saving ? "Mentés..." : "Mentés"}</button>
              </div>
              {notice && <p className="success">{notice}</p>}

              <h3>Tételek</h3>
              <div className="admin-items-grid">
                {(order.items || []).map((item, index) => (
                  <article key={`${item.productSlug}-${index}`} className="admin-item-card">
                    <img src={item.productImageUrl} alt={item.productName} />
                    <div>
                      <h4>{item.productName}</h4>
                      <p>{formatSelections(item.selections)}</p>
                      {item.upload?.url && (
                        <p>
                          Fájl: <a href={item.upload.url} target="_blank" rel="noreferrer">{item.upload.originalName || "megnyitás"}</a>
                        </p>
                      )}
                      <p><strong>{Number(item.lineTotalFt || 0).toLocaleString("hu-HU")} Ft</strong></p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
