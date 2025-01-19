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

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有的复制按钮
    const copyButtons = document.querySelectorAll('.code-header button');

    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 找到按钮对应的代码块
            const codeBlock = button.closest('.code-header').nextElementSibling.querySelector('code');
            const codeLines = codeBlock.querySelectorAll('span:not(.line-number)'); // 排除行号

            // 提取代码文本
            const codeText = Array.from(codeLines).map(line => line.textContent).join('\n');

            // 创建一个临时的textarea元素用于复制
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = codeText;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);

            // 显示复制成功的提示
            const originalTitle = button.getAttribute('data-title-succeed');
            const originalIcon = button.querySelector('i').className;
            button.querySelector('i').className = 'fas fa-check';
            button.setAttribute('aria-label', originalTitle);

            // 2秒后恢复原始状态
            setTimeout(() => {
                button.querySelector('i').className = originalIcon;
                button.setAttribute('aria-label', 'copy');
            }, 2000);
        });
    });
});
