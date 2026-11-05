# myCarto, concept de refonte

Une refonte complète du site [my-carto.com](https://my-carto.com/), le logiciel de cartographie du SI d’AB+ Software, réalisée en Vue 3 par Théo Naulet pour une candidature au poste de développeur front UI/UX à Montpellier.

**Ce n’est pas le site officiel.** La marque myCarto, son logo, ses visuels, ses textes et les logos clients appartiennent à leurs propriétaires. Les formulaires n’envoient rien, et la maquette ne dépose aucun cookie.

## Le parti pris

- **Leur marque, mieux utilisée.** Navy `#262E6F`, jaune `#FAC130`, leurs illustrations, pictos, photos et logos clients : rien n’est inventé hors de leur kit. Seule la police change : leur Nexa est sous licence, elle est remplacée par Outfit, sa plus proche alternative libre (SIL OFL), avec Noto Sans pour le texte. Les deux sont hébergées avec le site.
- **Beaucoup moins de texte.** Un titre et une ligne par section, un nom et une ligne par élément. Leurs contenus sont repris et condensés, jamais inventés : chiffres, citations et clients sont les leurs.
- **Le contraste par les fonds.** Les sections alternent blanc, navy, gris clair et jaune, sans filet ni ombre.
- **La carte se dessine toute seule.** C’est la promesse du produit, et l’idée des animations : rails, flux, schémas et graphiques se tracent quand on arrive dessus. Un jeton BPMN parcourt même le processus d’exemple.

Le système visuel complet est décrit dans [DESIGN.md](DESIGN.md), et le contexte du projet dans [PRODUCT.md](PRODUCT.md).

## Lancer le projet

```bash
pnpm install
pnpm dev               # le site, http://localhost:5173
pnpm storybook         # le système de design, http://localhost:6006
pnpm build             # vérification des types (vue-tsc) puis build Vite dans dist/
pnpm build-storybook   # Storybook statique dans storybook-static/
pnpm lint:css          # Stylelint : paliers nommés, aucun !important
```

Node 22 ou plus récent. Le site est une SPA : en production, toutes les routes doivent renvoyer `index.html`.

## Les pages

| Groupe | Pages |
|---|---|
| Accueil | `/` |
| Produit | `/logiciel`, `/fonctionnalites`, `/integration`, `/tarifs`, `/solu-qiq` |
| Pour qui ? | `/metiers` (et `/metiers/:role`), `/secteurs`, `/methode` |
| Clients | `/clients`, 10 cas clients sur `/clients/:slug`, `/club-utilisateurs` |
| Ressources | `/ressources`, 13 articles sur `/ressources/:slug`, `/evenements`, `/faq` |
| Entreprise | `/a-propos`, `/recrutement`, `/demo`, `/contact` |
| Informations | `/mentions-legales`, `/confidentialite`, `/plan-du-site` |

## Le système de design

Storybook (`pnpm storybook`) présente les briques du site, rendues par **les composants du site eux-mêmes**, avec les mêmes styles et le même build :

- **Fondations** : les jetons (couleurs et contrastes, typographie, espacements, formes, mouvement) et les quatre paliers ;
- **Briques** : `BaseButton`, `BaseBadge`, `KeyList` (la liste encadrée), `TickList`, `PageHero` ;
- **Navigation** : l’en-tête et ses menus, le pied de page, les onglets (`RolePicker`, `SectorPicker`) ;
- **Produit et clients** : `FeatureIntro`, `InteropHub`, les schémas dessinés, `MethodTrail`, `FaqList`, `CaseCard`, `EventCountdown`.

Le sélecteur **Fond** de la barre d’outils pose chaque brique sur les quatre fonds du site, et l’onglet *Accessibility* audite chaque story (axe).

### Les règles du CSS, et ce qui les fait tenir

| Règle | Garde-fou |
|---|---|
| Quatre paliers nommés (`--bp-l` 1100, `--bp-m` 900, `--bp-s` 720, `--bp-xs` 560), écrits une seule fois dans `src/styles/breakpoints.css` | Stylelint refuse un `max-width` en dur ; le build échoue sur un nom de palier inconnu |
| Zéro `!important`, sauf la préférence « réduire les animations », qui doit l’emporter sur tout | Stylelint (`declaration-no-important`), l’exception est commentée dans `base.css` |
| Des jetons, pas de valeurs en dur | revue, et la page *Jetons* de Storybook |
| Un composant suit son fond : dans `.on-navy`, le bouton contour, les pastilles et le focus passent en clair | dans le composant, jamais dans les pages |

## Organisation du code

```
src/
  main.ts, App.vue, router.ts   point d’entrée, coquille (en-tête, page, appel final, pied de page), routes
  pages/                        une page par route, chargée à la demande
  components/
    ui/                         briques partagées : BaseButton, BaseBadge, PageHero, KeyList (la liste encadrée), TickList
    **/*.stories.ts             les stories Storybook, à côté de leur composant
    product/, audiences/, clients/   composants propres à un groupe de pages
    *.vue                       sections de la home, en-tête, pied de page
  data/                         tout le contenu, typé, séparé des composants
    nav.ts                      source unique des menus, du pied de page et du plan du site
    articles.ts + articles/     index des articles, corps en JSON chargés à la demande
  motion/
    draw.ts                     directive v-draw : un tracé se dessine une fois, à l’arrivée
    reveal.ts                   apparition au défilement, sur tout le site, sans balisage
  styles/                       jetons (couleurs, typo, espacements, mouvement), paliers, styles de base
  docs/                         pages de documentation Storybook (introduction, jetons, paliers)
.storybook/                     configuration Storybook (fonds, routeur, thème)
public/brand/                   les visuels de la marque, triés par usage
scripts/                        extraction du contenu depuis my-carto.com
```

## Quelques choix techniques

- **Le contenu vit dans `src/data/`**, typé en TypeScript, séparé des composants : changer un texte ne touche pas un `.vue`.
- **Une seule source pour la navigation.** Les menus déroulants, le pied de page et le plan du site lisent tous `nav.ts`.
- **Chargement à la demande.** Chaque page est un chunk séparé, et les 13 articles sont des fichiers JSON importés seulement quand on les ouvre (`import.meta.glob`).
- **Des composants partagés plutôt que du copier-coller.** `BaseButton` est le seul bouton du site, `BaseBadge` la seule pastille, `PageHero` ouvre chaque page intérieure, et `KeyList` décline la liste encadrée de la home pour les menus, les en-têtes et les listes de services.
- **Des illustrations dessinées en SVG** dans le style à plat de la marque (couches du SI, schéma d’interopérabilité, diagramme BPMN, graphique des tarifs, route de la méthode). Elles ne simulent pas de fausses captures du produit.
- **Les animations ne gênent personne.** Elles passent par des animations CSS qui n’écrasent pas les transitions des composants, et rien n’est masqué si JavaScript manque. Avec « réduire les animations », tout s’affiche directement.
- **Accessibilité.** Menus au clavier (Échap, clic à l’extérieur), onglets avec les flèches, focus visible sur chaque fond, sauts de lien, contrastes de la charte respectés, textes alternatifs.

## D’où vient le contenu

Les textes, chiffres, citations et visuels proviennent de my-carto.com (novembre 2026). Les articles et la FAQ ont été extraits par les scripts de `scripts/` :

```bash
python3 -I scripts/extract_article.py page-article.html article.json   # un article en blocs JSON
python3 -I scripts/build_articles.py dossier-json/ .                    # src/data/articles/*.json et articles.ts
python3 -I scripts/extract_faq.py page-faq.html faq.json                # la FAQ en thèmes et questions
python3 -I scripts/page_to_text.py page.html                            # n’importe quelle page en texte lisible
```

Les pages HTML sont à télécharger d’abord depuis my-carto.com. Les textes de la FAQ, des cas clients et des pages ont ensuite été condensés à la main.
