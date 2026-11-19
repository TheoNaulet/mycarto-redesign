# myCarto Atlas

La bibliothèque de composants de l'application myCarto (visualiseur de cartes et espace d'administration), en Vue 3 + TypeScript, documentée dans un Storybook dédié.

```bash
pnpm dev:atlas               # l'application, http://localhost:6007
pnpm storybook:atlas         # les composants, http://localhost:6008
pnpm build-storybook:atlas   # Storybook statique dans storybook-atlas-static/
pnpm typecheck:atlas         # vérification des types (vue-tsc)
```

## Utiliser

```ts
import './packages/atlas/src/styles/atlas.css'            // une fois
import { McButton, McNode } from './packages/atlas/src'   // puis les composants
```

Les styles sont du CSS pur en classes `.mc-*` qui ne lisent que des variables : ils se réutilisent hors Vue (Angular, React, HTML).

## Organisation

| Dossier | Contenu |
|---|---|
| `src/tokens/` | `tokens.json` (source des valeurs) et `tokens.css` (thèmes clair et sombre) |
| `src/styles/` | `atlas.css` (point d'entrée), `components.css`, `states.css` |
| `src/icons/` | `McIcon.vue` et les pictogrammes |
| `src/components/` | un dossier par composant : `McXxx.vue` et `McXxx.stories.ts` |
| `src/utils/` | types partagés (couches, états, criticité) et calcul des liens de carte |
| `src/docs/` | pages de documentation Storybook (fondations) |
| `src/screens/` | les écrans (Accueil, Carte, Fiche, Impact, Explorateur, Tableau de bord), aussi visibles dans Storybook |
| `app/` | l'application : routeur, thème (système, Alt+T pour basculer) |

## Règles

1. La couleur de couche dit ce qu'est un objet ; l'état dit comment il va. Jamais l'un à la place de l'autre.
2. Le jaune, c'est l'action et ce qui est actif : un seul bouton jaune par vue.
3. Chaque composant documente tous ses états : repos, survol, focus, sélection, désactivé, chargement, erreur, vide, en clair et en sombre.

Les polices sont auto-hébergées (Outfit à la place de Nexa, Noto Sans). Les pictogrammes sont provisoires, en attendant ceux de myCarto.
