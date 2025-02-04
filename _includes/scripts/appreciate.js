document.addEventListener("DOMContentLoaded", function () {
    var appreciateButton = document.querySelector(".appreciate-icon");
    var appreciateQRCode = document.querySelector(".appreciate-qrcode");

    if (appreciateButton && appreciateQRCode) {
        appreciateButton.addEventListener("mouseover", function () {
            appreciateQRCode.style.display = "flex";
        });

        appreciateButton.addEventListener("mouseout", function () {
            appreciateQRCode.style.display = "none";
        });
    }
});
