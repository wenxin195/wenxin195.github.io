const requests = new Map();
/** Shared CDN loader; failures and timeouts may be explicitly retried. */
export function loadScript(src, { timeout = 30000 } = {}) {
  if (requests.has(src)) return requests.get(src);
  const request = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => fail(new Error(`加载超时：${src}`)), timeout);
    function fail(error) { clearTimeout(timer); script.remove(); reject(error); }
    script.src = src;
    script.async = true;
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => fail(new Error(`加载失败：${src}`));
    document.head.append(script);
  }).catch((error) => { requests.delete(src); throw error; });
  requests.set(src, request);
  return request;
}
