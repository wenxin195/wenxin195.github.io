from pathlib import Path
from html.parser import HTMLParser

class Checker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_false = False
        self.depth = 0
        self.lines_in_false = 0
        self.false_blocks = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "figure" and attrs.get("class") == "code-block":
            if attrs.get("data-lineno") == "false":
                self.in_false = True
                self.depth = 1
                self.false_blocks += 1
            return
        if self.in_false:
            self.depth += 1
            classes = attrs.get("class", "").split()
            if "code-block__line" in classes:
                self.lines_in_false += 1

    def handle_endtag(self, tag):
        if self.in_false:
            self.depth -= 1
            if self.depth <= 0:
                self.in_false = False

text = Path("_site/event-and-probability-simulation.html").read_text(encoding="utf-8")
c = Checker()
c.feed(text)
print("false blocks:", c.false_blocks)
print("line spans inside false blocks:", c.lines_in_false)

# leftover legacy
for needle in ("rouge-table", "code-header", "figure.highlight", "highlighter-rouge"):
    # highlighter-rouge may remain on inline code
    count = text.count(needle)
    print(f"{needle}: {count}")
