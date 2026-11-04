"""Extract a my-carto.com blog post into JSON blocks for the redesign.
usage: python3 -I scripts/extract_article.py <file.html> <out.json>
Blocks: {type: p|h2|h3|ul|ol, text|items}. Links and emphasis are flattened to text."""
import html
import json
import re
import sys
from html.parser import HTMLParser

src = open(sys.argv[1], encoding='utf-8').read()


def meta(key):
    m = re.search(r'<meta[^>]+(?:property|name)="' + re.escape(key) + r'"[^>]+content="([^"]*)"', src)
    return html.unescape(m.group(1)) if m else None


start = src.find('data-elementor-type="wp-post"')
if start < 0:
    start = src.find('elementor-widget-theme-post-content')
start = src.rfind('<div', 0, start)


class Body(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.done = False
        self.blocks = []
        self.cur = None  # (type, [text parts])
        self.list = None  # (type, items)
        self.item = None
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if self.done:
            return
        if tag == 'div':
            self.depth += 1
        if tag in ('script', 'style', 'svg', 'figure', 'button', 'form'):
            self.skip += 1
        if self.skip:
            return
        if tag in ('p', 'h2', 'h3', 'h4', 'h5', 'blockquote'):
            t = {'h4': 'h3', 'h5': 'h3', 'blockquote': 'p'}.get(tag, tag)
            if self.item is None:
                self.flush()
                self.cur = (t, [])
        elif tag in ('ul', 'ol'):
            self.flush()
            self.list = (tag, [])
        elif tag == 'li':
            self.item = []
        elif tag == 'br':
            self.text(' ')

    def handle_endtag(self, tag):
        if self.done:
            return
        if tag in ('script', 'style', 'svg', 'figure', 'button', 'form'):
            self.skip = max(0, self.skip - 1)
            return
        if tag == 'div':
            self.depth -= 1
            if self.depth == 0:
                self.flush()
                self.done = True
            return
        if self.skip:
            return
        if tag in ('p', 'h2', 'h3', 'h4', 'h5', 'blockquote') and self.item is None:
            self.flush()
        elif tag == 'li' and self.item is not None:
            txt = clean(''.join(self.item))
            if txt and self.list:
                self.list[1].append(txt)
            self.item = None
        elif tag in ('ul', 'ol') and self.list:
            if self.list[1]:
                self.blocks.append({'type': self.list[0], 'items': self.list[1]})
            self.list = None

    def text(self, data):
        if self.item is not None:
            self.item.append(data)
        elif self.cur:
            self.cur[1].append(data)

    def handle_data(self, data):
        if self.done or self.skip:
            return
        self.text(data)

    def flush(self):
        if self.cur:
            txt = clean(''.join(self.cur[1]))
            if txt:
                self.blocks.append({'type': self.cur[0], 'text': txt})
        self.cur = None


def clean(s):
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace("'", '’')
    s = re.sub(r'\s+([:;?!»])', ' \\1', s)
    s = re.sub(r'«\s*', '« ', s)
    return s


p = Body()
p.feed(src[start:])
blocks = p.blocks
# Drop the closing sales pitch and empty headings.
while blocks and blocks[-1]['type'] in ('h2', 'h3'):
    blocks.pop()
out = {
    'title': clean(meta('og:title') or ''),
    'excerpt': clean(meta('og:description') or ''),
    'date': (meta('article:published_time') or '')[:10],
    'image': meta('og:image'),
    'blocks': blocks,
}
json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
words = sum(len((b.get('text') or ' '.join(b.get('items', []))).split()) for b in blocks)
print(f"{sys.argv[2].split('/')[-1]}: {len(blocks)} blocks, {words} words, date {out['date']}, image {out['image']}")
