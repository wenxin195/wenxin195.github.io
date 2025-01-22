document.addEventListener("DOMContentLoaded", () => {
    const scrollToTopButton = document.getElementById("scroll-to-top");

    // 显示和隐藏按钮
    window.addEventListener("scroll", () => {
        scrollToTopButton.style.display = window.scrollY > 300 ? "block" : "none";
    });

    // 点击事件，滚动到顶部
    scrollToTopButton.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
