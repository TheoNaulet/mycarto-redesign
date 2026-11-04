"""Extract the my-carto.com FAQ (mc-faq markup) into sections / questions / answer paragraphs.
usage: python3 -I scripts/extract_faq.py <faq.html> <out.json>"""
import html
import json
import re
import sys

src = open(sys.argv[1], encoding='utf-8').read()


def text(s):
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(re.sub(r'\s+', ' ', s)).strip()
    s = s.replace("'", '’')
    s = re.sub(r'\s+([:;?!»])', ' \\1', s)
    return s


sections = []
for sec in re.split(r'class="mc-faq__section"', src)[1:]:
    title = re.search(r'class="mc-faq__section-title"[^>]*>([\s\S]*?)</', sec)
    items = []
    for it in re.split(r'class="mc-faq__item"', sec)[1:]:
        q = re.search(r'class="mc-faq__question"[^>]*>([\s\S]*?)<(?:span|svg|i)\b[^>]*mc-faq__chevron', it) or re.search(r'class="mc-faq__question"[^>]*>([\s\S]*?)</button>', it)
        a = re.search(r'class="mc-faq__answer-inner"[^>]*>([\s\S]*?)</div>', it)
        paras = [text(p) for p in re.findall(r'<(?:p|li)[^>]*>([\s\S]*?)</(?:p|li)>', a.group(1))] if a else []
        if not paras and a:
            paras = [text(a.group(1))]
        items.append({'q': text(q.group(1)) if q else '?', 'a': [p for p in paras if p]})
    sections.append({'title': text(title.group(1)) if title else '?', 'items': items})

json.dump(sections, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for s in sections:
    print('##', s['title'])
    for i in s['items']:
        first = i['a'][0] if i['a'] else ''
        print(f"  - {i['q']}  [{len(i['a'])} §, {sum(len(x.split()) for x in i['a'])} mots]")
        print(f"      {first[:260]}")
