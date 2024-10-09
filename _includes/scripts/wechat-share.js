document.addEventListener('DOMContentLoaded', function () {
    var wechatButton = document.querySelector('.share-wechat');
    var wechatQRCode = document.querySelector('.wechat-qrcode');

    if (wechatButton && wechatQRCode) {
        wechatButton.addEventListener('mouseover', function () {
        wechatQRCode.style.display = 'block';
        });

        wechatButton.addEventListener('mouseout', function () {
        wechatQRCode.style.display = 'none';
        });
    }
});
  