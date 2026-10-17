import { importModule } from '@/utils/import-module.js';
const content = document.querySelector('.js-article-body');
const modal = document.querySelector('.js-lightbox-modal');
const selector = 'img:not(.emoji):not([data-lightbox-ignore]):not(.lightbox-ignore)';
let instance, loading, intended, cancelled = false;
function ensure() {
  if (instance) return Promise.resolve(instance);
  if (!loading) loading = importModule(new URL('../features/lightbox.js', import.meta.url)).then(({ init }) => {
    instance = init({ modalEl: modal, contentEl: content });
    if (!instance) throw new Error('图片预览暂不可用');
    return instance;
  }).catch((error) => { loading = null; throw error; });
  return loading;
}
if (content && modal) {
  content.querySelectorAll(selector).forEach((img) => {
    img.classList.add('popup-image');
    if (!img.closest('a, button')) { img.tabIndex = 0; img.setAttribute('role', 'button'); }
  });
  const intent = (event) => {
    if (event.target.matches?.(selector)) void ensure().catch(() => {});
  };
  content.addEventListener('pointerover', intent, { passive: true });
  content.addEventListener('focusin', intent);
  async function open(event) {
    const img = event.target.closest?.(selector);
    if (!img || (event.type === 'keydown' && !['Enter', ' '].includes(event.key))) return;
    if (instance && event.type === 'click') return;
    event.preventDefault(); event.stopImmediatePropagation();
    intended = img; cancelled = false;
    img.setAttribute('aria-busy', 'true');
    try {
      const ready = await ensure();
      if (!cancelled && intended === img) ready.openImage(img);
    } catch {
      const message = document.createElement('button');
      message.type = 'button'; message.className = 'resource-error';
      message.textContent = '图片预览加载失败，点击重试';
      message.addEventListener('click', () => { message.remove(); img.click(); }, { once: true });
      img.after(message);
    } finally { img.removeAttribute('aria-busy'); }
  }
  content.addEventListener('click', open, true);
  content.addEventListener('keydown', open, true);
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') cancelled = true; });
}
