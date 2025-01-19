document.addEventListener('DOMContentLoaded', function() {
    // 获取所有的复制按钮
    const copyButtons = document.querySelectorAll('.code-header button');

    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 找到按钮对应的代码块
            const codeBlock = button.closest('.code-header').nextElementSibling.querySelector('.rouge-code pre');

            // 提取代码文本，保留格式
            const codeText = codeBlock.innerText;

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
