import { FormEvent, useEffect, useMemo, useState } from "react";
import { calculateQuote, getHealth } from "./api";
import type { Color, Paper, Qty, QuoteResponse, Size } from "./types";

const sizeOptions: Size[] = ["A6", "A5", "A4"];
const paperOptions: Paper[] = ["130g", "170g"];
const colorOptions: Color[] = ["1+0", "4+0", "4+4"];
const qtyOptions: Qty[] = [100, 250, 500, 1000];

function App() {
  const [size, setSize] = useState<Size>("A6");
  const [paper, setPaper] = useState<Paper>("130g");
  const [color, setColor] = useState<Color>("1+0");
  const [qty, setQty] = useState<Qty>(100);
  const [lamination, setLamination] = useState(false);

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("checking...");

  const formatHuf = useMemo(
    () =>
      new Intl.NumberFormat("hu-HU", {
        maximumFractionDigits: 0
      }),
    []
  );

  useEffect(() => {
    let isMounted = true;
    getHealth()
      .then((result) => {
        if (isMounted) {
          setHealthStatus(result.status ?? "ok");
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus("unreachable");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await calculateQuote({ size, paper, color, qty, lamination });
      setQuote(response);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unexpected error while calculating quote.";
      setError(message);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="container">
        <header className="header">
          <h1>Print Quote</h1>
          <p className="health">
            API health: <strong>{healthStatus}</strong>
          </p>
        </header>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            <span>Size</span>
            <select value={size} onChange={(event) => setSize(event.target.value as Size)}>
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Paper</span>
            <select value={paper} onChange={(event) => setPaper(event.target.value as Paper)}>
              {paperOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Color</span>
            <select value={color} onChange={(event) => setColor(event.target.value as Color)}>
              {colorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Qty</span>
            <select value={qty} onChange={(event) => setQty(Number(event.target.value) as Qty)}>
              {qtyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={lamination}
              onChange={(event) => setLamination(event.target.checked)}
            />
            <span>Lamination</span>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Számolás..." : "Ár kiszámítása"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {quote && (
          <article className="result-card">
            <h2>Ajánlat</h2>
            <p className="final-price">
              {formatHuf.format(quote.final_price)} {quote.currency}
            </p>

            <ul className="breakdown-list">
              {quote.breakdown.map((item) => (
                <li key={`${item.label}-${item.amount}`}>
                  <span>{item.label}</span>
                  <strong>
                    {formatHuf.format(item.amount)} {quote.currency}
                  </strong>
                </li>
              ))}
            </ul>

            <details>
              <summary>Debug JSON</summary>
              <pre>{JSON.stringify(quote, null, 2)}</pre>
            </details>
          </article>
        )}
      </section>
    </main>
  );
}

export default App;
