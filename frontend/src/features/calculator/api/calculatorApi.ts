import { http } from "../../../api/http";
import type { QuoteRequest, QuoteResponse } from "../../../types";

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
