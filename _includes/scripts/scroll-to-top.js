document.addEventListener("DOMContentLoaded", function () {
    const scrollToTopButton = document.getElementById("scroll-to-top");

    // 显示和隐藏按钮
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            scrollToTopButton.style.display = "block";
        } else {
            scrollToTopButton.style.display = "none";
        }
    });

    // 点击事件，滚动到顶部
    scrollToTopButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
