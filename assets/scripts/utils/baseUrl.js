/**
 * 从 `<meta name="baseurl">` 读取站点 baseurl（去掉末尾斜杠）。
 * @return {string}
 */
export function getBaseUrl() {
  const meta = document.querySelector('meta[name="baseurl"]');
  if (!meta) return '';
  return (meta.getAttribute('content') || '').replace(/\/$/, '');
}
