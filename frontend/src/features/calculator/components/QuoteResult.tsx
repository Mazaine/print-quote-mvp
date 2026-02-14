import type { QuoteResponse } from "../../../types";

interface QuoteResultProps {
  quote: QuoteResponse;
  formatHuf: Intl.NumberFormat;
}

export function QuoteResult({ quote, formatHuf }: QuoteResultProps) {
  return (
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
  );
}
