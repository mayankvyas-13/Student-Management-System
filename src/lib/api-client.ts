/**
 * Small typed wrapper around fetch() for browser code.
 * Never throws: always returns either { ok: true, data } or { ok: false, error }.
 */

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export async function apiRequest<T>(
  path: string,
  options: { method: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown },
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: options.method,
      headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "Could not reach the server. Is it running?" } };
  }

  if (res.status === 204) return { ok: true, data: undefined as T };

  const json: unknown = await res.json().catch(() => null);
  if (res.ok) return { ok: true, data: json as T };

  const error =
    json !== null && typeof json === "object" && "error" in json
      ? (json as { error: ApiError }).error
      : { code: `HTTP_${res.status}`, message: "Request failed." };
  return { ok: false, error };
}
