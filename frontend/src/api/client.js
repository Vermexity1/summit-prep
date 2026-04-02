const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
      "Unable to reach the local API. Start the app with `npm start` from the project root, or use `npm start` inside `frontend` so the backend starts too."
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export const api = {
  get: (path, token) => apiRequest(path, { token }),
  post: (path, body, token) => apiRequest(path, { method: "POST", body, token })
};
