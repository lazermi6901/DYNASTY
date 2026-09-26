import {Quest} from "./Quest.js";
import {answer,SUGGESTIONS} from "./DialogueAI.js";
import {Economy} from "./Economy.js";
const $=s=>document.querySelector(s);
const STYLES=[
  {name:"Gardien du val",body:0x315a8a,cape:0x6e2f32,swatch:"#496f9c"},
  {name:"Voyageuse des bois",body:0x567f5c,cape:0x624b70,swatch:"#78a179"},
  {name:"Éclaireur d'aube",body:0x91734b,cape:0x3f6377,swatch:"#b99663"}
];
export class GameFlow {
  constructor({player,npcs,ui,saved}){
    Object.assign(this,{player,npcs,ui});
    this.character=this.validCharacter(saved?.character);
    this.quest=new Quest(saved?.quest);
    this.visits=saved?.visits&&typeof saved.visits==="object"?{...saved.visits}:{};
    this.started=false;this.speechTimer=null;this.activeNpc=null;this.styleIndex=0;
    this.origin=this.player.data();
    if(this.character)this.applyAppearance(this.character.style);
    $("#play-button").addEventListener("click",()=>this.character?this.play():this.showCreator());
    $("#create-button").addEventListener("click",()=>this.showCreator());
    $("#creator-back").addEventListener("click",()=>this.hideCreator());
    $("#confirm-character").addEventListener("click",()=>this.create());
    $("#quest-pill").addEventListener("click",()=>this.ui.open("quest"));
    $("#npc-prompt").addEventListener("click",()=>{const p=this.npcs.nearest(this.player.data().x,this.player.data().z);if(p)this.talk(p);});
    $("#dialogue-close").addEventListener("click",()=>this.closeDialogue());
    $("#npc-question-form").addEventListener("submit",e=>{e.preventDefault();const input=$("#npc-question");if(input.value.trim())this.reply(input.value);input.value="";});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#dialogue").hidden)this.closeDialogue();});
    this.renderStart();
  }
  validCharacter(v){return typeof v?.name==="string"&&v.name.length>=2&&v.name.length<=16&&Number.isInteger(v.style)&&STYLES[v.style]?{name:v.name,style:v.style}:null;}
  renderStart(){
    $("#start-profile").textContent=this.character?this.character.name+" · "+STYLES[this.character.style].name:"Aucun personnage créé";
    $("#play-button").textContent=this.character?"Jouer":"Créer puis jouer";
  }
  showCreator(){
    if(this.character&&!confirm("Créer un nouveau personnage remplacera le personnage, le sac et la quête actuels. Continuer ?"))return;
    $("#character-creator").hidden=false;$("#start-screen").hidden=true;
    $("#character-name").value="";$("#creator-error").textContent="";
    $("#appearance-options").innerHTML=STYLES.map((s,i)=>'<button type="button" data-style="'+i+'" aria-pressed="'+(i===0)+'"><span style="background:'+s.swatch+'">♙</span><strong>'+s.name+'</strong></button>').join("");
    this.styleIndex=0;
    $("#appearance-options").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
      this.styleIndex=Number(b.dataset.style);
      $("#appearance-options").querySelectorAll("button").forEach(other=>other.setAttribute("aria-pressed",String(other===b)));
    }));
    $("#character-name").focus();
  }
  hideCreator(){$("#character-creator").hidden=true;$("#start-screen").hidden=false;}
  create(){
    const name=$("#character-name").value.trim().replace(/\s+/g," ");
    if(!/^[\p{L}\p{N} '-]{2,16}$/u.test(name)){$("#creator-error").textContent="Utilisez 2 à 16 lettres, chiffres, espaces, apostrophes ou traits d'union.";return;}
    this.character={name,style:this.styleIndex};this.quest=new Quest(null);this.visits={};
    this.ui.economy=new Economy();
    this.player.target=null;this.player.group.position.set(0,this.ui.world.height(0,12),12);
    this.origin={x:0,z:12};this.applyAppearance(this.styleIndex);
    this.persist();$("#character-creator").hidden=true;this.renderStart();this.play();
  }
  applyAppearance(style){this.player.setAppearance(STYLES[style]?.body??STYLES[0].body,STYLES[style]?.cape??STYLES[0].cape);}
  play(){
    if(!this.character)return this.showCreator();
    this.started=true;$("#start-screen").hidden=true;
    this.origin=this.player.data();this.refreshQuest();
  }
  persist(){this.ui.persist();}
  snapshot(){return {character:this.character,quest:this.quest.snapshot(),visits:this.visits};}
  action(event){if(this.started&&this.quest.progress(event)){this.refreshQuest();this.persist();}}
  tick(){
    if(!this.started)return;
    const p=this.player.data();
    if(this.quest.current()?.event==="move"&&Math.hypot(p.x-this.origin.x,p.z-this.origin.z)>1.4)this.action("move");
    const near=this.npcs.nearest(p.x,p.z);
    $("#npc-prompt").hidden=!near||!$("#dialogue").hidden||!$("#sheet").hidden;
    if(near)$("#npc-prompt").textContent="Parler à "+near.name+" · "+near.role;
  }
  refreshQuest(){
    const step=this.quest.current();$("#quest-pill").hidden=false;
    $("#quest-label").textContent=step?step.title:"Initiation terminée";
    if(this.ui.active==="quest")this.ui.render();
  }
  talk(npc){
    if(!this.started)return;
    this.ui.close();this.activeNpc=npc;
    this.visits[npc.id]=(Number(this.visits[npc.id])||0)+1;this.persist();
    $("#npc-name").textContent=npc.name+" · "+npc.role;
    $("#dialogue").hidden=false;$("#npc-prompt").hidden=true;
    const guideStep=this.quest.current()?.event;
    if(npc.id==="mira"&&guideStep==="guide")this.action("guide");
    else if(npc.id==="mira"&&guideStep==="guideAgain")this.action("guideAgain");
    this.say(answer(npc.id,"bonjour",this.context(npc)));
    const choices=$("#dialogue-choices");choices.replaceChildren();
    for(const option of SUGGESTIONS){
      const button=document.createElement("button");button.type="button";button.textContent=option.label;
      button.addEventListener("click",()=>this.reply(option.text));choices.appendChild(button);
    }
  }
  context(npc){return {name:npc.name,role:npc.role,visits:this.visits[npc.id]||0,questTitle:this.quest.current()?.title};}
  reply(question){if(this.activeNpc)this.say(answer(this.activeNpc.id,question,this.context(this.activeNpc)));}
  say(value){
    clearInterval(this.speechTimer);const target=$("#npc-response");target.textContent="";let index=0;
    this.speechTimer=setInterval(()=>{index=Math.min(value.length,index+3);target.textContent=value.slice(0,index);if(index>=value.length)clearInterval(this.speechTimer);},18);
  }
  closeDialogue(){clearInterval(this.speechTimer);$("#dialogue").hidden=true;this.activeNpc=null;}
}
