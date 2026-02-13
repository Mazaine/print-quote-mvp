import type { QuoteRequest, QuoteResponse } from "./types";

export const API_BASE = "http://127.0.0.1:8001";

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return (await response.json()) as { status: string };
}

export async function calculateQuote(payload: QuoteRequest): Promise<QuoteResponse> {
  const response = await fetch(`${API_BASE}/quote/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Quote request failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as QuoteResponse;
}
