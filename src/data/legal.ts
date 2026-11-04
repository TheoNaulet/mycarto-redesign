// Legal pages. The texts describe my-carto.com (taken from their pages, November 2026);
// each page opens on what applies to this concept, which collects nothing.

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'pills'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'facts'; items: { name: string; value: string }[] }

export interface LegalDoc {
  title: string
  lede: string
  notice: { title: string; text: string }
  source: string
  sections: { id: string; title: string; blocks: LegalBlock[] }[]
}

export const legal: Record<'mentions' | 'rgpd', LegalDoc> = {
  mentions: {
    title: 'Mentions légales',
    lede: 'Qui édite le site myCarto, où il est hébergé, et vos droits sur vos données.',
    notice: {
      title: 'Cette page est une maquette',
      text: 'Ce site est un concept de refonte non officiel, réalisé pour une candidature. Il ne collecte aucune donnée. Les mentions ci-dessous sont celles du site officiel my-carto.com.',
    },
    source: 'https://my-carto.com/mentions-legales/',
    sections: [
      {
        id: 'editeur',
        title: 'Éditeur du site',
        blocks: [
          {
            type: 'facts',
            items: [
              { name: 'Société', value: 'AB+ Software, SARL au capital de 142 100 €' },
              { name: 'Siège social', value: '137 rue Claude Balbastre, 34000 Montpellier' },
              { name: 'RCS', value: 'Montpellier, 488 714 387 00039' },
              { name: 'Téléphone', value: '04 67 50 56 11' },
              { name: 'E-mail', value: 'contact@abplussoftware.fr' },
            ],
          },
        ],
      },
      {
        id: 'hebergement',
        title: 'Hébergement',
        blocks: [
          { type: 'p', text: 'Le site officiel est hébergé sur le cloud Microsoft Azure, dans le centre de données « France Centre ».' },
        ],
      },
      {
        id: 'droits',
        title: 'Vos données personnelles',
        blocks: [
          {
            type: 'p',
            text: 'Selon la loi « Informatique et Libertés » du 6 janvier 1978 modifiée, vous disposez d’un droit d’opposition, d’accès, de rectification et de suppression des données vous concernant.',
          },
          { type: 'p', text: 'Pour l’exercer, écrivez à AB+ Software, 137 rue Claude Balbastre à Montpellier, ou à contact@abplussoftware.fr.' },
        ],
      },
      {
        id: 'credits',
        title: 'Crédits du site officiel',
        blocks: [
          {
            type: 'facts',
            items: [
              { name: 'Développement', value: 'Impulz Consulting' },
              { name: 'Conception graphique', value: 'Le Manoir aux Histoires' },
              { name: 'Rédaction', value: 'Équipe AB+ Software, agence 22 mètres' },
              { name: 'Illustrations', value: 'Adobe Stock, Unsplash, Material Design Icons, DALL·E, M. Lecompt / UPSaclay' },
            ],
          },
        ],
      },
    ],
  },
  rgpd: {
    title: 'Politique de confidentialité',
    lede: 'Les données que le site myCarto collecte, pourquoi, combien de temps, et comment exercer vos droits.',
    notice: {
      title: 'Ici, rien n’est collecté',
      text: 'Cette maquette ne dépose aucun cookie, n’utilise aucun outil de mesure et n’envoie pas ce que vous saisissez dans ses formulaires. La politique ci-dessous est celle du site officiel my-carto.com.',
    },
    source: 'https://my-carto.com/politique-rgpd-ab-software/',
    sections: [
      {
        id: 'responsable',
        title: 'Responsable du traitement',
        blocks: [
          {
            type: 'facts',
            items: [
              { name: 'Responsable', value: 'myCarto, AB+ Software, 137 rue Claude Balbastre, 34700 Montpellier' },
              { name: 'Contact RGPD', value: 'contact@abplussoftware.fr' },
            ],
          },
        ],
      },
      {
        id: 'donnees',
        title: 'Les données collectées',
        blocks: [
          { type: 'p', text: 'Par les formulaires, pour gérer prospects et clients et envoyer les newsletters, avec votre consentement ou par intérêt légitime :' },
          { type: 'pills', items: ['Nom et prénom', 'Adresse e-mail', 'Téléphone', 'Fonction et société'] },
          { type: 'p', text: 'Par la navigation, pour les statistiques et l’optimisation technique : adresse IP (anonymisée pour Google Analytics), navigateur et système, pages consultées et durée de visite.' },
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies et traceurs',
        blocks: [
          {
            type: 'table',
            head: ['Type', 'Outil', 'À quoi il sert', 'Base légale', 'Durée'],
            rows: [
              ['Nécessaire', 'Cookies techniques WordPress', 'Navigation, sécurité, formulaire de contact', 'Intérêt légitime', 'La session'],
              ['Analytique', 'Google Analytics', 'Mesure du trafic et des parcours', 'Consentement', '14 mois'],
              ['Publicité', 'Google Ads', 'Publicités ciblées et mesure', 'Consentement', '24 mois'],
              ['Fonctionnel', 'Mailjet', 'Préférences et abonnement newsletter', 'Consentement', '24 mois'],
            ],
          },
          { type: 'p', text: 'Aucun cookie publicitaire ou analytique n’est activé sans votre consentement. Vous pouvez changer d’avis à tout moment, depuis le bandeau cookies ou votre navigateur.' },
        ],
      },
      {
        id: 'durees',
        title: 'Durées de conservation',
        blocks: [
          {
            type: 'table',
            head: ['Données', 'Conservées'],
            rows: [
              ['Formulaires', '3 ans après le dernier contact'],
              ['Cookies analytiques', '14 mois'],
              ['Cookies publicitaires', '24 mois'],
              ['Logs serveur', '12 mois'],
              ['Données marketing Mailjet', '24 mois après désabonnement'],
            ],
          },
        ],
      },
      {
        id: 'droits',
        title: 'Vos droits',
        blocks: [
          {
            type: 'pills',
            items: ['Accès', 'Rectification', 'Suppression', 'Limitation', 'Opposition', 'Portabilité', 'Retrait du consentement'],
          },
          { type: 'p', text: 'Pour les exercer, à tout moment : contact@abplussoftware.fr.' },
        ],
      },
      {
        id: 'partage',
        title: 'Sous-traitants et sécurité',
        blocks: [
          { type: 'ul', items: ['Google, pour Analytics et Ads', 'Mailjet, pour les newsletters et e-mails', 'L’hébergeur, pour le stockage et la sécurité'] },
          { type: 'p', text: 'Les transferts hors UE sont encadrés par les clauses contractuelles types. Le site est en HTTPS, les accès sont restreints, les sauvegardes régulières et les données sensibles ne sont pas stockées en clair.' },
        ],
      },
    ],
  },
}
