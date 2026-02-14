export const API_BASE = "http://127.0.0.1:8001";

export async function http(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, init);
}
