import type { QuoteRequest, QuoteResponse, CalculatorCatalogResponse } from "./types";

export const API_BASE = import.meta.env.VITE_API_URL ?? "https://print-quote-mvp.onrender.com";

/**
 * Thin fetch wrapper so we can call relative API paths safely.
 */
async function http(path: string, init?: RequestInit): Promise<Response> {
  const url = `${API_BASE}${path}`;
  return fetch(url, init);
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await http("/health");
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return (await response.json()) as { status: string };
}

export async function calculateQuote(payload: QuoteRequest): Promise<QuoteResponse> {
  const response = await http("/quote/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Quote request failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as QuoteResponse;
}

export async function getCalculatorOptions(): Promise<CalculatorCatalogResponse> {
  const response = await http("/calculator/options");
  if (!response.ok) {
    throw new Error(`Options request failed with status ${response.status}`);
  }
  return (await response.json()) as CalculatorCatalogResponse;
}
