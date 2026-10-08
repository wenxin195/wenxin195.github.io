import { Modal } from '@/lib/modal.js';
import { Gallery } from '@/lib/gallery.js';

/**
 * 正文灯箱 / 图库。
 * @param {{
 *   modalEl: (?Element|undefined),
 *   contentEl: (?Element|undefined),
 *   lockRoot: (?Element|undefined),
 *   scrollElement: (?Element|undefined)
 * }=} options
 * @return {{destroy: function(): undefined}|null}
 */
export function init(options = {}) {
  const modalEl = options.modalEl
    ?? document.querySelector('.js-lightbox-modal');
  const contentEl = options.contentEl
    ?? document.querySelector('.js-article-body');

  if (!modalEl || !contentEl) return null;

  const closeEl = modalEl.querySelector('.js-lightbox-close');

  const rawImages = Array.from(
    contentEl.querySelectorAll('img:not(.emoji):not([data-lightbox-ignore]):not(.lightbox-ignore)'),
  );

  if (rawImages.length === 0) return null;

  let modal = null;
  let gallery = null;
  let galleryRoot = null;
  let onContentClick = null;
  let onGalleryBlankClick = null;

  const items = rawImages.map((img) => ({
    src: img.currentSrc || img.src,
    w: img.naturalWidth,
    h: img.naturalHeight,
    el: img,
    title: img.alt || '',
  }));

  galleryRoot = modalEl.querySelector('.gallery');
  if (!galleryRoot) {
    console.warn('[lightbox] .gallery not found inside modal');
    return null;
  }

  gallery = new Gallery(galleryRoot, items, {
    disabled: true,
    swiperOptions: {
      animation: true,
      keyboard: true,
    },
  });

  const imgToIndex = new Map();
  for (let i = 0; i < items.length; i++) {
    const img = items[i].el;
    img.classList.add('popup-image');
    imgToIndex.set(img, i);
  }

  modal = new Modal(modalEl, {
    closeOnBackdropClick: true,
    lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
    scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
    onChange: (visible) => {
      gallery?.setOptions({ disabled: !visible });
      document.body.classList.toggle('overflow-hidden', visible);
    },
  });

  onGalleryBlankClick = (e) => {
    const target = e.target;
    if (!(target instanceof Element) || !modal?.visible) return;
    if (target.closest('img, .swiper__button, .gallery__counter, .gallery__caption')) return;
    modal.hide();
  };
  galleryRoot.addEventListener('click', onGalleryBlankClick);

  const onCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal?.hide();
  };
  closeEl?.addEventListener('click', onCloseClick);

  onContentClick = (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const img = target.closest('img.popup-image');
    if (!img || !imgToIndex.has(img)) return;

    gallery.slideTo(imgToIndex.get(img), false);
    modal.show();
  };

  contentEl.addEventListener('click', onContentClick);

  return {
    destroy() {
      closeEl?.removeEventListener('click', onCloseClick);
      if (onContentClick) {
        contentEl.removeEventListener('click', onContentClick);
        onContentClick = null;
      }
      if (onGalleryBlankClick) {
        galleryRoot?.removeEventListener('click', onGalleryBlankClick);
        onGalleryBlankClick = null;
      }
      gallery?.destroy?.();
      gallery = null;
      galleryRoot = null;
      modal?.destroy();
      modal = null;
      document.body.classList.remove('overflow-hidden');
    },
  };
}
