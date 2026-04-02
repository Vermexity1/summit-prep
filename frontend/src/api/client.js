function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const isBrowser = typeof window !== "undefined";
  const host = isBrowser ? window.location.hostname : "";
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const isVercelHost = host.endsWith(".vercel.app");

  // On Vercel, prefer the same-origin /api rewrite so the browser never needs direct CORS calls
  // to the Render backend.
  if (isVercelHost) {
    return "/api";
  }

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  // In production on Vercel we proxy /api to the Render backend with vercel.json.
  return isLocalhost ? "/api" : "/api";
}

const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error(
      `Unable to reach the API at ${API_BASE_URL}. If this is the live site, the backend may still be waking up on Render or the frontend rewrite may not be deployed yet.`
    );
  }

  const raw = await response.text();
  const data = raw ? safeParseJson(raw) : null;

  if (!response.ok) {
    throw new Error(data?.error || raw || `Request failed with status ${response.status}.`);
  }

  return data;
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const api = {
  get: (path, token) => apiRequest(path, { token }),
  post: (path, body, token) => apiRequest(path, { method: "POST", body, token })
};
