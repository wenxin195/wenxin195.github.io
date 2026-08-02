/**
 * 将外部 http(s) 链接设为新标签页打开，并加上 noopener。
 * @return {{destroy: function(): undefined}|null}
 */
export function init() {
  const links = document.querySelectorAll('a[href^="http://"], a[href^="https://"]');

  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return {
    destroy() {
      // Attributes are left in place; no listeners to remove.
    },
  };
}
