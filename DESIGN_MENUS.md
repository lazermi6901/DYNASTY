# DYNASTY — cahier des charges des menus mobiles

Ce document décrit une interface originale de MMORPG tactique mobile. Il sert de contrat de conception pour les phases suivantes. Un écran n'apparaît dans l'application que lorsque ses données et ses actions existent réellement. Aucun nom, icône ou dessin de DOFUS Touch n'est repris.

## Système visuel commun

- Palette : fond vert presque noir `#111b19`, panneaux `#26372f`, texte ivoire `#ece4cf`, accent laiton `#d7bd78`. Codage secondaire de rareté seulement quand des objets existeront.
- Texte : titre de panneau en police sérif lisible, données et contrôles en police système. Taille courante 13–16 px ; contrôles principaux au moins 44 × 44 px.
- Structure iPhone : vue 3D en arrière-plan, barre de navigation courte en bas, panneau sur 80 à 86 % de la hauteur, marge de sécurité iOS. Un seul panneau modal à la fois.
- Panneau : en-tête avec contexte, titre et fermer ; contenu défilant ; commande primaire en bas près du contenu concerné. Retour au monde sans perdre l'état en cours, sauf action validée.
- Feedback : résultat ou cause de l'échec visible à côté de l'action. Confirmation seulement avant perte d'objet ou dépense irréversible. Valeurs et prix viennent de l'état réel, jamais d'une décoration.
- Navigation : un menu secondaire ne figure dans « Menu » que lorsque son système a été implémenté. Combat : interface séparée, avec mode placement puis tour par tour.
- Accessibilité : labels explicites pour les icônes, focus visible, ordre de tabulation cohérent, tailles tactiles confortables, respect du mouvement réduit lors des animations futures.

## Contrats écran par écran

| Écran | Disposition tactile | Actions et état nécessaires avant activation |
|---|---|---|
| 01 · HUD | Monde dominant ; bandeau région/personnage ; barre courte de fonctions existantes ; cible contextuelle | Déplacer le héros, recentrer la caméra, ouvrir les seuls panneaux opérationnels. Zone et position réelles. |
| 02 · Personnage | Portrait ou modèle en haut ; statistiques réelles en liste ; équipements sur vue dédiée | Lire le personnage persisté ; équiper seulement quand système d'objets implémenté. En phase 1 : la position réelle est affichée dans la carte ; ce panneau reste prévu pour la progression du personnage. |
| 03 · Inventaire | Filtres horizontaux, grille de cases larges, capacité, tri et recherche | Source d'objets persistée ; filtre et tri réels ; détail à l'appui ; gestion de capacité. |
| 04 · Fiche objet | Visuel, nom, rareté, prérequis, effets, description, actions en pied | Équiper, utiliser, déplacer ou détruire seulement si permis par le type d'objet ; confirmer la destruction. |
| 05 · Sorts | Capacités par classe, liste tactile et fiche au toucher | PA, portée, effets et prévisualisation basés sur moteur de combat ; aucune valeur fictive. |
| 06 · Barre de combat | Emplacements disponibles en haut, liste de capacités en bas | Réordonner par glisser ou sélection ; sauvegarder l'ordre ; verrouiller selon progression réelle. |
| 07 · Quêtes | Liste classée avec état ; détail : objectif, zone, récompenses | Suivre/arrêter le suivi ; étapes validées par événements du jeu ; récompense délivrée une seule fois. |
| 08 · Carte monde | Carte plein écran, zoom, couches et marqueurs filtrables | Position du héros, points découverts et régions provenant du monde ; aucun point sans position physique. |
| 09 · Carte locale | Vue topographique, position du héros, constructions, toucher pour se déplacer | Transposition fidèle des coordonnées ; refus d'un trajet bloqué ; phase 1 disponible sur une seule région. |
| 10 · Bestiaire | Liste des créatures rencontrées puis fiche individuelle | Espèces enregistrées à la découverte ; caractéristiques et butins provenant des données de combat. |
| 11 · Métiers | Cartes de métiers avec niveau, XP et recettes accessibles | Gain d'XP par action validée ; conditions de déblocage exactes. |
| 12 · Fabrication | Résultat au sommet ; ingrédients avec possédé/requis ; quantité ; bouton fixe | Vérifier ressources côté état du jeu avant chaque fabrication ; consommer puis créer de façon atomique. |
| 13 · Amélioration | Objet, composants, valeurs avant/après, coût et résultat | N'autoriser que les combinaisons prévues ; afficher les probabilités si le système en a ; confirmer le coût. |
| 14 · Marché | Recherche, filtres, fiche annonce, achat/vente et annonces personnelles | Nécessite comptes, stockage et transactions serveur ; prix et disponibilités synchronisés. |
| 15 · Banque | Deux vues sac/coffre, filtres communs, quantité et transfert | Stockage persistant ; droits d'accès ; transferts atomiques ; refus si capacité dépassée. |
| 16 · Guilde | Bannière, membres, progression, activités, paramètres | Création et appartenance serveur ; rôles et permissions contrôlés côté serveur. |
| 17 · Groupe | Membres, chef, invitations, état de présence | Invitations acceptées et composition réelles ; règles de chef appliquées. |
| 18 · Social | Amis, invitations, groupes et guilde | Identifiants de compte, états synchronisés, recherche et gestion des demandes. |
| 19 · Montures | Modèle/portrait, nom, progression, caractéristiques et invocation | Acquisition, position, restrictions et sauvegarde de la monture. |
| 20 · Donjons | Entrée physique, contexte, difficulté, équipe et récompenses connues | Bouton entrer seulement près de l'entrée réelle et si conditions satisfaites. |
| 21 · Placement | Terrain tactique en fond, cases autorisées, ordre d'équipe, validation | Placer chaque combattant selon règles et espace libre ; validation de tous les joueurs requis. |
| 22 · Combat | Grille majoritaire ; initiative en haut ; PV/PA/PM et sorts en bas ; fin de tour distincte | Moteur de tours, portée/ligne de vue, collisions, états, actions légales, serveur autoritaire en multijoueur. |
| 23 · Résultat combat | Issue, XP, objets et changements de quête, puis Continuer | Calcul unique de récompenses ; état persisté avant sortie du panneau. |
| 24 · PNJ | Dialogue sur fond de monde, portrait compact, réponses distinctes | Branches conditionnées par quête/état ; interaction seulement à portée du PNJ réel. |
| 25 · Succès | Catégories, progression et détail des critères | Compteurs alimentés par événements du jeu ; récompenses attribuées une fois. |
| 26 · Réglages | Cartes caméra, qualité, audio si présent, commandes, accessibilité | Ajustements immédiatement appliqués et enregistrés ; contrôle affiché seulement si l'option agit. Phase 1 : caméra et résolution. |

## Navigation à livrer au fil des phases

1. Prototype actuel : Monde → Carte locale / Inventaire / Boutique / Menu principal → Réglages. La position du héros apparaît dans Carte, avec sélection de destination, trajet direct et téléportation.
2. Quand objets et quêtes existent : Monde → Inventaire / Quêtes, puis détails d'objet et suivi.
3. Quand combat existe : exploration → placement → tours → résultat → exploration.
4. Quand serveur, comptes et économie existent : groupe, guilde, amis, marché et banque. Aucune transaction ne doit vivre uniquement dans le navigateur.

## Critères de validation

- Chaque contrôle modifie un état visible, ouvre une information alimentée par des données réelles ou explique explicitement une impossibilité.
- Le même personnage garde sa position et ses préférences après fermeture/réouverture sur l'appareil.
- La fermeture d'un menu rend le geste de déplacement au monde ; le fond du panneau ne déclenche pas de déplacement.
- Les panneaux restent utilisables sur petit iPhone, en orientation portrait et avec les marges système.
- Toute action de jeu influant sur d'autres joueurs doit être validée par le serveur lorsqu'un multijoueur réel sera créé.
