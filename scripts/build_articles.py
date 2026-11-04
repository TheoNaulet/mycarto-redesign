"""Write the article bodies (src/data/articles/<slug>.json) and their index (src/data/articles.ts).
usage: python3 -I scripts/build_articles.py <artjson dir> <repo dir>"""
import json
import math
import os
import re
import sys

src_dir, repo = sys.argv[1], sys.argv[2]
BLOG = 'https://my-carto.com/blog/'

# slug, source file, short title, one-line excerpt, topic. Order = newest first is computed from dates.
ARTICLES = [
    ('nis2', 'directive-nis2-cartographie-si-conformite', 'NIS2 : garantir sa conformité avec la cartographie du SI', 'Pourquoi la cartographie du SI est clé pour la conformité NIS2.', 'cyber'),
    ('dette-technique', 'dette-technique-cartographie-si', 'Dette technique : la piloter grâce à la cartographie du SI', 'La visualiser, la prioriser, la réduire.', 'urba'),
    ('mapping-it', 'ressources-mapping-it-definition', 'Mapping IT : définition et lien avec la cartographie SI', 'Deux termes, une même démarche.', 'urba'),
    ('pos', 'plan-occupation-sols-urbanisation-si', 'Plan d’Occupation des Sols (POS) : urbanisation du SI', 'Définition, méthode de construction et exemples.', 'urba'),
    ('applicative', 'cartographie-applicative', 'Cartographie applicative : méthode et exemples', 'Une méthode en 6 étapes et un exemple concret.', 'urba'),
    ('anssi', 'cartographie-anssi-cybersecurite', 'Cartographie ANSSI : sécurisez votre SI efficacement', 'Les recommandations de l’ANSSI, appliquées.', 'cyber'),
    ('risques', 'cartographie-risques-it', 'Cartographie des risques IT : définition, enjeux et outils', 'Anticiper les menaces avec une analyse claire.', 'cyber'),
    ('processus', 'cartographie-des-processus', 'Cartographie des processus : définition, exemples et guide', 'Du BPMN au SI : qui fait quoi, quand et avec quoi.', 'urba'),
    ('architecture-cyber', 'architecture-dentreprise-et-cartographie-du-si-des-maillons-cles-de-la-strategie-de-cybersecurite', 'Cartographie et architecture : le socle de la cybersécurité', 'Connaître son SI pour mieux le défendre.', 'cyber'),
    ('cybersecurite', 'pourquoi-la-cartographie-du-si-renforce-la-cybersecurite', 'Pourquoi la cartographie du SI renforce la cybersécurité', 'Voir ses dépendances pour réduire son exposition.', 'cyber'),
    ('rgpd', 'cartographie-du-si-et-rgpd-de-linventaire-a-laudit', 'Cartographie du SI et RGPD : de l’inventaire à l’audit', 'Les traitements de données, reliés au SI réel.', 'cyber'),
    ('complexite', 'gerer-la-complexite-du-systeme-dinformation-avec-une-cartographie-du-si', 'Complexité de l’infrastructure IT : réduire et simplifier votre SI', 'Moins de complexité, plus d’efficacité.', 'urba'),
    ('strasbourg', 'strasbourg-cartographie-du-si-et-ppm-pour-la-gouvernance', 'Strasbourg : cartographie du SI et PPM pour la gouvernance', 'L’Eurométropole relie cartographie et portefeuille de projets.', 'terrain'),
]

PITCH = re.compile(r'(👉|➡️|👇|✅|Demandez une démo|Demander une démo|Prêts? à transformer|Contactez[- ]nous|Découvrez myCarto en démo)', re.I)
URL = re.compile(r'https?://\S+')


def tidy(blocks):
    out, seen = [], set()
    for b in blocks:
        key = json.dumps(b, ensure_ascii=False)
        if key in seen:
            continue
        seen.add(key)
        text = b.get('text', '')
        if b['type'] in ('p', 'h2', 'h3') and PITCH.search(text):
            continue
        if b['type'] == 'p' and URL.search(text):
            m = URL.search(text)
            out.append({'type': 'link', 'text': 'Lire l’article complet sur CIO Online' if 'cio-online' in m.group(0) else 'Lire la source', 'href': m.group(0).rstrip('.')})
            continue
        if b['type'] in ('ul', 'ol'):
            items = [i for i in b['items'] if not PITCH.search(i)]
            if not items:
                continue
            b = {**b, 'items': items}
        out.append(b)
    # Headings left with nothing under them.
    cleaned = []
    for i, b in enumerate(out):
        nxt = out[i + 1] if i + 1 < len(out) else None
        if b['type'] in ('h2', 'h3') and (nxt is None or nxt['type'] in ('h2',) or (b['type'] == 'h3' and nxt['type'] == 'h3')):
            continue
        cleaned.append(b)
    return cleaned


def words(blocks):
    return sum(len((b.get('text') or ' '.join(b.get('items', []))).split()) for b in blocks)


os.makedirs(os.path.join(repo, 'src/data/articles'), exist_ok=True)
index = []
for slug, src, title, excerpt, topic in ARTICLES:
    d = json.load(open(os.path.join(src_dir, f'{src}.json'), encoding='utf-8'))
    blocks = tidy(d['blocks'])
    json.dump(blocks, open(os.path.join(repo, f'src/data/articles/{slug}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    w = words(blocks)
    index.append({
        'slug': slug, 'title': title, 'excerpt': excerpt, 'topic': topic, 'date': d['date'],
        'minutes': max(1, math.ceil(w / 230)), 'href': f'{BLOG}{src}/',
    })
    print(f'{slug:20} {len(blocks):3} blocks {w:5} words {d["date"]}')

index.sort(key=lambda a: a['date'], reverse=True)

ts = ['// Generated from my-carto.com (November 2026): the 13 posts of their blog, bodies in ./articles/<slug>.json.', '']
ts.append("export type Topic = 'cyber' | 'urba' | 'terrain'")
ts.append('')
ts.append('export const topics: { id: Topic; label: string }[] = [')
ts.append("  { id: 'cyber', label: 'Cybersécurité et conformité' },")
ts.append("  { id: 'urba', label: 'Urbanisation et méthode' },")
ts.append("  { id: 'terrain', label: 'Retours d’expérience' },")
ts.append(']')
ts.append('')
ts.append('export interface Article {')
ts.append('  slug: string')
ts.append('  title: string')
ts.append('  excerpt: string')
ts.append('  topic: Topic')
ts.append('  date: string')
ts.append('  minutes: number')
ts.append('  /** The original post on my-carto.com. */')
ts.append('  href: string')
ts.append('}')
ts.append('')
ts.append('export const articles: Article[] = [')
for a in index:
    ts.append('  {')
    for k in ('slug', 'title', 'excerpt', 'topic', 'date'):
        v = a[k].replace("'", "\\'")
        ts.append(f"    {k}: '{v}',")
    ts.append(f"    minutes: {a['minutes']},")
    ts.append(f"    href: '{a['href']}',")
    ts.append('  },')
ts.append(']')
ts.append('')
ts.append('export type Block =')
ts.append("  | { type: 'p' | 'h2' | 'h3'; text: string }")
ts.append("  | { type: 'ul' | 'ol'; items: string[] }")
ts.append("  | { type: 'link'; text: string; href: string }")
ts.append('')
ts.append("const bodies = import.meta.glob<Block[]>('./articles/*.json', { import: 'default' })")
ts.append('')
ts.append('/** Loads one article body on demand, so the list page does not ship 13 articles. */')
ts.append('export function loadBody(slug: string): Promise<Block[]> | undefined {')
ts.append('  return bodies[`./articles/${slug}.json`]?.()')
ts.append('}')
ts.append('')
ts.append('export function formatDate(iso: string): string {')
ts.append("  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })")
ts.append('}')
open(os.path.join(repo, 'src/data/articles.ts'), 'w', encoding='utf-8').write('\n'.join(ts) + '\n')
print('index written,', len(index), 'articles')
