import { useEffect, useMemo, useState } from "react";

import { calculateQuote, getHealth } from "./api/calculatorApi";
import { CalculatorForm } from "./components/CalculatorForm";
import { QuoteResult } from "./components/QuoteResult";
import type { Color, Paper, Qty, QuoteResponse, Size } from "../../types";

export function CalculatorFeature() {
  const [size, setSize] = useState<Size>("A6");
  const [paper, setPaper] = useState<Paper>("130g");
  const [color, setColor] = useState<Color>("1+0");
  const [qty, setQty] = useState<Qty>(100);
  const [lamination, setLamination] = useState(false);

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>("ellenőrzés...");

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
          setHealthStatus(result.status ?? "rendben");
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus("nem elérhető");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await calculateQuote({ size, paper, color, qty, lamination });
      setQuote(response);
    } catch {
      setError("Váratlan hiba történt.");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="container">
        <header className="header">
          <h1>Árkalkulátor</h1>
          <p className="health">
            API állapot: <strong>{healthStatus}</strong>
          </p>
        </header>

        <CalculatorForm
          size={size}
          paper={paper}
          color={color}
          qty={qty}
          lamination={lamination}
          loading={loading}
          onSizeChange={setSize}
          onPaperChange={setPaper}
          onColorChange={setColor}
          onQtyChange={setQty}
          onLaminationChange={setLamination}
          onSubmit={onSubmit}
        />

        {error && <p className="error">{error}</p>}

        {quote && <QuoteResult quote={quote} formatHuf={formatHuf} />}
      </section>
    </main>
  );
}
