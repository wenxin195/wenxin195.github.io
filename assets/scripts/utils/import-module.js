const attempts = new Map();
const requests = new Map();

/** A failed module fetch is cached by browsers; retry with a fresh URL, same build namespace. */
export function importModule(url) {
  const key = String(url);
  if (requests.has(key)) return requests.get(key);
  const attempt = attempts.get(key) || 0;
  const target = new URL(key, location.href);
  if (attempt) target.searchParams.set('retry', String(attempt));
  const request = import(target.href).catch((error) => {
    requests.delete(key);
    attempts.set(key, attempt + 1);
    throw error;
  });
  requests.set(key, request);
  return request;
}
