import { authFetch } from "../utils/authFetch";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5079/api";

console.log("[backendClient] Using backend:", API_BASE);

const backend = {
  async get(path, options = {}) {
    const res = await authFetch(API_BASE + path, {
      method: "GET",
      ...options,
    });

    if (!res.ok) {
      throw new Error(`GET ${path} failed (${res.status})`);
    }

    if (res.status === 204) return null;
    return res.json();
  },

  async post(path, body, options = {}) {
    const res = await authFetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });

    if (!res.ok) {
      throw new Error(`POST ${path} failed (${res.status})`);
    }

    if (res.status === 204) return null;
    return res.json();
  },


  async put(path, body, options = {}) {
    const res = await authFetch(API_BASE + path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`PUT ${path} failed (${res.status})`);
    }

    return res.status === 204 ? null : res.json();
  },

  async delete(path, options = {}) {
    const res = await authFetch(API_BASE + path, {
      method: "DELETE",
      ...options,
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`DELETE ${path} failed (${res.status})`);
    }

    return res.status === 204 ? null : res.json();
  },
};

export default backend;
