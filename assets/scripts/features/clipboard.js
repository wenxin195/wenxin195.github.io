/**
 * @param {string} text
 * @return {!Promise<boolean>}
 */
async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_err) {
      // fall through to execCommand
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

/**
 * @param {!Element} btn
 * @param {boolean} success
 */
function showFeedback(btn, success) {
  const icon = btn.querySelector('.fa-clipboard, .fa-check, .fa-xmark');
  const feedbackIconStyle = 'fas';
  const feedbackIconType = success ? 'fa-check' : 'fa-xmark';
  const feedbackClass = success ? 'copy-success' : 'copy-error';
  const feedbackText = success ? '已复制！' : '复制失败';

  if (!icon) {
    btn.disabled = false;
    return;
  }

  icon.classList.remove('far', 'fas', 'fa-clipboard', 'fa-check', 'fa-xmark');
  icon.classList.add(feedbackIconStyle, feedbackIconType);
  btn.classList.add(feedbackClass);
  btn.setAttribute('aria-label', feedbackText);

  setTimeout(() => {
    icon.classList.remove(feedbackIconStyle, feedbackIconType);
    icon.classList.add('far', 'fa-clipboard');
    btn.classList.remove(feedbackClass);
    btn.setAttribute('aria-label', '复制代码');
    btn.disabled = false;
  }, 2000);
}

/**
 * @param {!Element} btn
 * @return {!Promise<undefined>}
 */
async function handleCopyButtonClick(btn) {
  if (btn.disabled) return;
  btn.disabled = true;

  const block = btn.closest('.code-block');
  const code = block?.querySelector('.code-block__body code');

  if (!code) {
    btn.disabled = false;
    return;
  }

  const success = await copyToClipboard(code.innerText);
  showFeedback(btn, success);
}

/**
 * 委托 `[data-code-copy]` 点击以复制 `.code-block` 源码（不含行号）。
 * @param {{root: (!(Document|Element)|undefined)}=} options
 * @return {{destroy: function(): undefined}}
 */
export function init(options = {}) {
  const root = options.root ?? document;

  const onClick = (event) => {
    const button = event.target.closest('[data-code-copy]');
    if (!button || (root !== document && !root.contains(button))) return;
    handleCopyButtonClick(button);
  };

  root.addEventListener('click', onClick);

  return {
    destroy() {
      root.removeEventListener('click', onClick);
    },
  };
}
