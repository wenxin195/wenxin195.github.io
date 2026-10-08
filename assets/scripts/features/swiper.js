import { iconEl } from '@/lib/icons.js';
import { Swiper } from '@/lib/swiper.js';

/**
 * 初始化正文中显式标记的 Swiper 组件。
 * @param {{root: (?ParentNode|undefined)}=} options
 * @return {!Array<!Swiper>}
 */
export function init(options = {}) {
  const root = options.root ?? document;
  const swipers = [];
  const elements = [];

  if (root instanceof Element && root.matches('.js-swiper')) {
    elements.push(root);
  }
  elements.push(...root.querySelectorAll('.js-swiper'));

  for (const element of elements) {
    if (element.dataset.swiperInitialized === 'true') continue;

    const previousButton = element.querySelector('.swiper__button--prev');
    const nextButton = element.querySelector('.swiper__button--next');

    if (previousButton) {
      previousButton.setAttribute('aria-label', '上一张');
      if (!previousButton.querySelector('.icon-lucide')) {
        previousButton.appendChild(iconEl('chevron-left'));
      }
    }
    if (nextButton) {
      nextButton.setAttribute('aria-label', '下一张');
      if (!nextButton.querySelector('.icon-lucide')) {
        nextButton.appendChild(iconEl('chevron-right'));
      }
    }

    swipers.push(new Swiper(element));
    element.dataset.swiperInitialized = 'true';
  }

  return swipers;
}
