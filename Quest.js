export const STEPS = [
  {title:"Faire ses premiers pas",hint:"Touchez le terrain pour faire marcher votre personnage.",event:"move"},
  {title:"Repérer le village",hint:"Ouvrez la carte et regardez votre position.",event:"map"},
  {title:"Parler à Mira",hint:"Touchez Mira près du point de départ, ou utilisez le bouton de dialogue.",event:"guide"},
  {title:"Examiner le sac",hint:"Ouvrez le Sac pour voir vos objets.",event:"inventory"},
  {title:"Découvrir la boutique",hint:"Ouvrez la Boutique et consultez un objet. Aucun achat requis.",event:"shopItem"},
  {title:"Retourner voir Mira",hint:"Parlez une nouvelle fois à Mira pour terminer l'initiation.",event:"guideAgain"}
];
export class Quest {
  constructor(saved) { this.step=Number.isInteger(saved?.step) ? Math.min(STEPS.length,Math.max(0,saved.step)) : 0; }
  current(){return STEPS[this.step]??null;}
  progress(event){if(this.current()?.event===event){this.step++;return true;}return false;}
  snapshot(){return {step:this.step};}
}
