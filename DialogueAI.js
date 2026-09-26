const normalize=t=>t.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const TOPICS=[
  {id:"movement",words:["deplac","march","boug","avanc","jouer"],label:"Comment marcher ?"},
  {id:"map",words:["carte","position","teleport","trajet","destination"],label:"Où est la carte ?"},
  {id:"quest",words:["quete","mission","objectif","faire","suite"],label:"Que faire ensuite ?"},
  {id:"bag",words:["sac","inventaire","objet","ressource"],label:"Que contient mon sac ?"},
  {id:"shop",words:["boutique","acheter","vendre","piece","marchand"],label:"Comment fonctionne la boutique ?"}
];
const LINES={
  mira:{hello:["Bienvenue à Val-des-Brumes. Commence par explorer le village.","Te revoilà. Le village a encore beaucoup à raconter."],movement:"Touchez le terrain pour marcher et glissez sur la vue pour tourner la caméra.",map:"La Carte montre votre position. Choisissez un point libre, puis marchez ou téléportez-vous.",quest:"Ton objectif actuel apparaît sous le titre DYNASTY. Touche-le pour voir l'étape suivante.",bag:"Le Sac rassemble les objets que tu possèdes. Consulte leurs fiches avant de les vendre.",shop:"À la Boutique, achats et ventes utilisent uniquement les pièces fictives du jeu.",fallback:"Je connais les chemins, la carte et la quête d'initiation. Demande-moi l'un de ces sujets."},
  oren:{hello:["J'étudie les sentiers du Val. Chaque pas change notre carte.","Le terrain est toujours différent selon l'endroit où l'on se tient."],movement:"Choisis le sol pour avancer. Un bâtiment bloque le passage : contourne-le.",map:"Ouvre la Carte pour voir tes coordonnées actuelles. La téléportation mène à une case praticable.",quest:"Suis les étapes de l'initiation ; Mira, près du centre, peut te guider.",bag:"Les ressources restent dans ton Sac jusqu'à leur vente.",shop:"Tala s'occupe du comptoir. Le bouton Boutique y donne accès depuis le monde.",fallback:"Je peux parler de déplacements, de carte ou de destinations."},
  tala:{hello:["Bienvenue au comptoir du Val. J'échange des curiosités et des fournitures.","Le comptoir est ouvert tant que les voyageurs sont de passage."],movement:"Touchez une zone libre pour venir au village, ou choisissez votre destination dans la Carte.",map:"La Carte indique votre position exacte dans le Val.",quest:"L'initiation t'emmènera voir Mira, puis le Sac et la Boutique.",bag:"Après un achat, l'objet apparaît dans ton Sac. Après une vente, sa quantité baisse.",shop:"Acheter retire les pièces affichées ; vendre rend la moitié du prix, arrondie à l'unité inférieure.",fallback:"Je connais surtout les objets, le Sac et la Boutique."}
};
const DAILY_LIFE={
  mira:["Je prépare les sentiers pour les voyageurs du matin.","Je vérifie que les nouveaux arrivants trouvent leur chemin.","Le village se calme, mais je garde un œil sur les chemins."],
  oren:["La lumière du matin révèle les reliefs de la vallée.","Je compare mes relevés avec les chemins empruntés aujourd'hui.","Je range mes cartes avant que la lumière ne baisse."],
  tala:["Je mets mes objets en place pour la journée.","Je compte les fournitures échangées au comptoir.","Je termine l'inventaire avant la prochaine ouverture."]
};
export function answer(npcId,question,ctx){
  const npc=LINES[npcId]||LINES.mira;
  const text=normalize(question.trim());
  const found=TOPICS.map(topic=>({topic,score:topic.words.reduce((n,w)=>n+(text.includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score)[0];
  if(found?.score>0){
    if(found.topic.id==="quest"&&ctx.questTitle)return npc.quest+" En ce moment : "+ctx.questTitle+".";
    return npc[found.topic.id];
  }
  if(text.includes("bonjour")||text.includes("salut")||!text){
    const hour=new Date().getHours(),part=hour<11?0:hour<18?1:2;
    return npc.hello[Math.min(ctx.visits>1?1:0,npc.hello.length-1)]+" "+(DAILY_LIFE[npcId]||DAILY_LIFE.mira)[part];
  }
  if(text.includes("qui es")||text.includes("ton nom"))return "Je suis "+ctx.name+", "+ctx.role.toLowerCase()+" de Val-des-Brumes.";
  return npc.fallback;
}
export const SUGGESTIONS=TOPICS.map(t=>({label:t.label,text:t.label}));
