import { getBaseUrl } from '@/utils/baseUrl.js';
import { throttle } from '@/utils/throttle.js';
import { iconEl } from '@/lib/icons.js';

/**
 * 挂载回到顶部与微信二维码悬浮操作。
 * TOC FAB 由 `features/toc-drawer` 注入（有 aside.toc 时）。
 *
 * @param {{mountRoot: (?Element|undefined)}=} options
 * @return {{destroy: function(): undefined}|null}
 */
export function init(options = {}) {
  const pageContent = options.mountRoot
    ?? document.querySelector('.js-shell-main');

  if (!pageContent) return null;

  const baseUrl = getBaseUrl();

  let floatingActions = pageContent.querySelector('.floating-actions');
  let createdHost = false;
  if (!floatingActions) {
    floatingActions = document.createElement('div');
    floatingActions.className = 'floating-actions';
    pageContent.appendChild(floatingActions);
    createdHost = true;
  }

  const qrcode = document.createElement('div');
  qrcode.className = 'qrcode';

  const qrcodeTrigger = document.createElement('button');
  qrcodeTrigger.type = 'button';
  qrcodeTrigger.className = 'float-btn qrcode__trigger';
  qrcodeTrigger.setAttribute('aria-label', '微信二维码');
  qrcodeTrigger.innerHTML = `<img class="float-btn__img" src="${baseUrl}/assets/qrcode.svg" alt="二维码" />`;

  const qrcodePopup = document.createElement('div');
  qrcodePopup.className = 'flyout flyout--rail';
  qrcodePopup.innerHTML = `
    <p class="flyout__title">扫描关注微信</p>
    <img class="flyout__media" src="${baseUrl}/assets/images/picture/donate/wechat.png" alt="微信二维码" />
  `;

  qrcode.appendChild(qrcodeTrigger);
  qrcode.appendChild(qrcodePopup);

  const scrollButton = document.createElement('button');
  scrollButton.type = 'button';
  scrollButton.className = 'float-btn float-btn--scroll-top';
  scrollButton.appendChild(iconEl('chevron-up'));
  scrollButton.setAttribute('aria-label', '返回顶部');

  floatingActions.appendChild(qrcode);
  floatingActions.appendChild(scrollButton);

  const handleScroll = throttle(function () {
    const show = window.scrollY > 300;
    scrollButton.classList.toggle('visible', show);
    qrcodeTrigger.classList.toggle('visible', show);
    qrcode.classList.toggle('visible', show);
  }, 200);

  const handleScrollTopClick = (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    if (window.location.hash) {
      history.replaceState(null, '', window.location.href.split('#')[0]);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  scrollButton.addEventListener('click', handleScrollTopClick);

  return {
    destroy() {
      window.removeEventListener('scroll', handleScroll);
      scrollButton.removeEventListener('click', handleScrollTopClick);
      handleScroll.cancel?.();
      qrcode.remove();
      scrollButton.remove();
      if (createdHost && !floatingActions.querySelector('.float-btn--toc')) {
        floatingActions.remove();
      }
    },
  };
}
