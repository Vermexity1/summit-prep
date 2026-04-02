function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  // In production on Vercel we proxy /api to the Render backend with vercel.json.
  return "/api";
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
