// Relative /api paths go through the Vite dev proxy, so port 8000 never needs to be public.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const response = init === undefined ? await fetch(url) : await fetch(url, init);
  if (!response.ok) throw new Error(`Unable to load data (request failed with ${response.status})`);
  return response.json() as Promise<T>;
}
