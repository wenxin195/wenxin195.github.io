from pathlib import Path

css = Path("_site/assets/css/main.css").read_bytes()
print("gt", css.count(b">"))
print("amp-gt", css.count(b"&gt;"))
print("brand-child", b".site-header__brand>" in css)
html = Path("_site/javascript-basic.html").read_text(encoding="utf-8")
print("code-blocks", html.count('figure class="code-block"'))
