

/**
 * Wrapper around fetch that automatically:
 * - Attaches the auth token (if present)
 * - Handles expired sessions (401)
 * - Optionally redirects to login
 *
 * @param {string} url
 * @param {object} options fetch options (supports `silent: true`)
 * @returns {Promise<Response>}
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");
  const silent = Boolean(options.silent);

  // Clone headers to avoid mutating caller input
  const headers = { ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Remove internal-only option before passing to fetch
  const { silent: _ignored, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle expired or invalid token
    if (response.status === 401) {
      // Always clear stale auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      /**
       * Only redirect if the user previously had a token
       * and this request is not marked as silent.
       */
      if (!silent && token) {
        window.location.href = "/user/login?expired=true";
      }
    }

    return response;
  } catch (err) {
    console.error("authFetch failed:", err);
    throw new Error(
      `Network or CORS error when fetching ${url}: ${err.message}`
    );
  }
}
