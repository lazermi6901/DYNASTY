# DYNASTY — exploration et menus fonctionnels (phase 1)

Prototype original, conçu pour iPhone et hébergeable sur GitHub Pages.

## Fonctions réellement disponibles

- Région 3D, personnage, déplacement tactile et caméra orientable.
- Carte locale : position réelle du personnage et coordonnées actualisées ; toucher une zone praticable la sélectionne comme destination.
- Deux actions depuis la carte : tracer un trajet à pied en ligne droite si libre, ou se téléporter directement à la destination ; la nouvelle position est enregistrée.
- Menu principal : accès aux seules sections utilisables.
- Inventaire : grille d’objets, recherche, catégories, quantités et fiche de chaque objet.
- Boutique : acheter et vendre avec des pièces de jeu fictives ; solde, prix et sac mis à jour immédiatement.
- Réglages : distance caméra et résolution 3D appliquées immédiatement, retour au village et recentrage.
- Sauvegarde locale de la position, des réglages, du solde et du sac.

Les systèmes combat, quêtes, marché entre joueurs et multijoueur ne sont pas implémentés dans ce prototype. Leurs commandes ne figurent donc pas dans l'application. Voir `DESIGN_MENUS.md` pour leur conception, sans promesse de fonctionnement actuel.

## Installation

Déposer les fichiers du ZIP à la racine du dépôt GitHub avec les dossiers `src/` et `data/`. Dans Settings → Pages, choisir Deploy from a branch, main et /(root). Ouvrir l'adresse GitHub Pages sur iPhone et ajouter à l'écran d'accueil si souhaité.

Three.js 0.180.0 est chargé depuis jsDelivr : la première ouverture nécessite Internet. La sauvegarde reste propre au navigateur et à l'appareil.

## Limites connues

Les déplacements se font en ligne droite ; il n'existe pas encore de recherche de chemin. La carte refuse un trajet traversant les obstacles. Le monde provient de la base « Chronicles Phase 1 », renommée ici DYNASTY pour correspondre au projet.

## Boutique et limites

Le joueur commence avec 240 pièces fictives, une corde et deux herbes. Les neuf objets et leurs prix sont originaux. Un achat retire le prix et ajoute une unité au sac ; la revente donne la moitié du prix, arrondie à l’entier inférieur. Les ressources sont actuellement des objets de collection : aucun effet de combat ou de fabrication n’est simulé. Les pièces ne s’achètent pas avec de l’argent réel. La sauvegarde locale n’est pas sécurisée contre les modifications manuelles et ne convient pas à une économie multijoueur.

## Lancement, personnage et initiation

À chaque ouverture, l'écran d'accueil propose Jouer et Créer un personnage. Une seule sauvegarde locale est gérée. Trois apparences originales changent les couleurs du personnage 3D. Créer un nouveau personnage après le premier demande une confirmation et remet à zéro la position, le sac et la quête.

La quête principale « Premiers pas » progresse avec six actions réelles : se déplacer, ouvrir la carte, parler à Mira, consulter le sac, examiner un objet en boutique et retourner voir Mira. La progression est enregistrée avec la partie.

Trois habitants animés sont visibles dans le monde : Mira, Oren et Tala. On peut toucher leur modèle 3D ou utiliser le bouton de dialogue à proximité. Leurs réponses dépendent de leur rôle, de la question posée, de la quête et du nombre de rencontres. Le moteur de dialogue fonctionne hors ligne avec des intentions et des réponses conçues pour le jeu : **ce n'est pas une IA générative**. Pour des réponses libres issues d'un modèle génératif, il faudrait plus tard un serveur et une API, sans exposer de clé dans la Web App.
