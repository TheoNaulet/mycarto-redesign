"""Turn a downloaded my-carto.com page into readable text: headings marked, images listed.
usage: python3 -I scripts/page_to_text.py <file.html> [maxchars]"""
import sys, re, html

t = open(sys.argv[1], encoding='utf-8').read()
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 12000
# Elementor pages: content sits between the header and footer templates.
m = re.search(r'<main[\s\S]*?</main>', t) or re.search(r'data-elementor-type="wp-page"[\s\S]*?data-elementor-type="footer"', t) or re.search(r'<body[\s\S]*', t)
t = m.group(0)
t = re.sub(r'<(script|style|noscript|svg|form)[\s\S]*?</\1>', '', t)
t = re.sub(r'<header[\s\S]*?</header>', '', t, count=1)
imgs = []

def img(mt):
    src = re.search(r'(?:data-src|src)="([^"]+)"', mt.group(0))
    alt = re.search(r'alt="([^"]*)"', mt.group(0))
    if src and 'data:image' not in src.group(1):
        imgs.append(src.group(1))
        return f"\n[IMG {src.group(1).split('/')[-1]} alt={alt.group(1) if alt else ''}]\n"
    return ''

t = re.sub(r'<img[^>]*>', img, t)
for lvl in range(1, 5):
    t = re.sub(rf'<h{lvl}[^>]*>', '\n' + '#' * lvl + ' ', t)
t = re.sub(r'<li[^>]*>', '\n- ', t)
t = re.sub(r'<br\s*/?>', '\n', t)
t = re.sub(r'</(p|h[1-6]|li|div|span|a|button|label|td|th|tr)>', '\n', t)
t = re.sub(r'<[^>]+>', '', t)
t = html.unescape(t)
out, prev = [], None
for line in (x.strip() for x in t.split('\n')):
    if line in ('-', '#', '##', '###', '####'):
        continue
    if line and line != prev:
        out.append(line)
    prev = line
txt = '\n'.join(out)
# cut the footer boilerplate
for marker in ('Plus jamais perdu dans votre SI\nmyCarto', 'Restez informé', 'Abonnez-vous à notre newsletter'):
    i = txt.rfind(marker)
    if i > 2000:
        txt = txt[:i]
print(txt[:limit])
