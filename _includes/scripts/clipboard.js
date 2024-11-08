function copyToClipboard(button) {
  // 找到包含代码的元素（tr > td.rouge-code > pre）
  const codeBlock = button.closest('.code-header').nextElementSibling.querySelector('.rouge-code pre');
  
  if (!codeBlock) {
    console.error("Could not find code block to copy.");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    // 使用现代 Clipboard API 进行复制
    navigator.clipboard.writeText(codeBlock.textContent.trim()).then(() => {
      // 显示复制成功信息
      showTooltip(button, "Copied!");
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  } else {
    // 使用旧的复制方法
    const textArea = document.createElement('textarea');
    textArea.value = codeBlock.textContent.trim();
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showTooltip(button, "Copied!");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
  }
}

function showTooltip(button, message) {
  // 创建提示元素
  const tooltip = document.createElement('div');
  tooltip.className = 'copy-tooltip';
  tooltip.textContent = message;
  
  // 设置提示位置
  document.body.appendChild(tooltip);
  const rect = button.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 30}px`;

  // 2秒后移除提示
  setTimeout(() => {
    tooltip.remove();
  }, 2000);
}
