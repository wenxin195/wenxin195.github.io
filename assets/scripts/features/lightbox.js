import { Modal } from '@/lib/modal.js';
import { Gallery } from '@/lib/gallery.js';
import { imagesLoad } from '@/utils/imagesLoad.js';

const MIN_IMAGE_WIDTH = 800;

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

  const rawImages = Array.from(
    contentEl.querySelectorAll('img:not([data-lightbox-ignore]):not(.lightbox-ignore)'),
  );

  if (rawImages.length === 0) return null;

  let destroyed = false;
  let modal = null;
  let gallery = null;
  let onContentClick = null;

  imagesLoad(rawImages).then(() => {
    if (destroyed) return;

    const items = rawImages
      .filter((img) => img.naturalWidth > MIN_IMAGE_WIDTH)
      .map((img) => ({
        src: img.src,
        w: img.naturalWidth,
        h: img.naturalHeight,
        el: img,
        title: img.alt || '',
      }));

    if (items.length === 0) return;

    const galleryRoot = modalEl.querySelector('.gallery');
    if (!galleryRoot) {
      console.warn('[lightbox] .gallery not found inside modal');
      return;
    }

    gallery = new Gallery(galleryRoot, items, {
      disabled: true,
      swiperOptions: {
        animation: true,
        keyboard: true,
      },
    });

    modal = new Modal(modalEl, {
      closeOnBackdropClick: true,
      lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
      scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
      onChange: (visible) => {
        gallery?.setOptions({ disabled: !visible });
        document.body.classList.toggle('overflow-hidden', visible);
      },
    });

    const imgToIndex = new Map();
    for (let i = 0; i < items.length; i++) {
      const img = items[i].el;
      img.classList.add('popup-image');
      img.dataset.galleryIndex = String(i);
      imgToIndex.set(img, i);
    }

    onContentClick = (e) => {
      const img = e.target.closest('img.popup-image');
      if (!img || !imgToIndex.has(img)) return;

      const index = imgToIndex.get(img);
      modal.show();
      gallery.slideTo(index, false);
    };

    contentEl.addEventListener('click', onContentClick);
  });

  return {
    destroy() {
      destroyed = true;
      if (onContentClick) {
        contentEl.removeEventListener('click', onContentClick);
        onContentClick = null;
      }
      gallery?.destroy?.();
      gallery = null;
      modal?.destroy();
      modal = null;
      document.body.classList.remove('overflow-hidden');
    },
  };
}
