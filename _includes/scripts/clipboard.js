// 常量定义
const SELECTORS = {
  BUTTON: '.code-header button',
  CODE_BLOCK: '.rouge-code pre',
  SUCCESS_ICON: 'fas fa-check'
};

// 复制文本到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// 更新按钮状态
const updateButtonState = (button, success) => {
  const icon = button.querySelector('i');
  const originalIcon = icon.className;
  const originalTitle = button.getAttribute('data-title-succeed') || 'copy';

  if (success) {
    icon.className = SELECTORS.SUCCESS_ICON;
    button.setAttribute('aria-label', originalTitle);
    button.classList.add('copy-success');
    
    setTimeout(() => {
      icon.className = originalIcon;
      button.setAttribute('aria-label', 'copy');
      button.classList.remove('copy-success');
    }, 2000);
  }
};

// 初始化复制功能
const initCopyButtons = () => {
  document.querySelectorAll(SELECTORS.BUTTON).forEach(button => {
    button.addEventListener('click', async () => {
      const codeBlock = button.closest('.code-header')
        .nextElementSibling
        .querySelector(SELECTORS.CODE_BLOCK);
      
      if (codeBlock) {
        const success = await copyToClipboard(codeBlock.innerText);
        updateButtonState(button, success);
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', initCopyButtons);
