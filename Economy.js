export const CATALOG = Object.freeze([
  {id:"lantern",name:"Lanterne des brumes",category:"Exploration",icon:"✧",price:45,description:"Une lanterne de voyage. Objet de collection dans cette phase."},
  {id:"compass",name:"Boussole de cuivre",category:"Exploration",icon:"⌾",price:70,description:"Instrument de voyage conservé dans le sac."},
  {id:"rope",name:"Corde tressée",category:"Exploration",icon:"〰",price:25,description:"Fourniture de voyage."},
  {id:"herbs",name:"Herbes du val",category:"Ressources",icon:"❧",price:18,description:"Plantes récoltées autour de Val-des-Brumes."},
  {id:"ore",name:"Minerai d'ardoise",category:"Ressources",icon:"◆",price:32,description:"Échantillon de roche du val."},
  {id:"wood",name:"Bois de frêne",category:"Ressources",icon:"♣",price:22,description:"Bois séché pour l'artisanat futur."},
  {id:"map",name:"Feuillet ancien",category:"Curiosités",icon:"▤",price:55,description:"Feuillet à ajouter à une collection."},
  {id:"charm",name:"Pendentif d'aube",category:"Curiosités",icon:"✦",price:95,description:"Petit objet de collection."},
  {id:"crystal",name:"Cristal pâle",category:"Curiosités",icon:"◇",price:120,description:"Cristal lumineux trouvé dans le val."}
]);
export const ITEM_BY_ID = Object.fromEntries(CATALOG.map(i=>[i.id,i]));
const MAX_SLOTS=24;
const START = {coins:240,items:{rope:1,herbs:2}};
export class Economy {
  constructor(saved) {
    const input=saved && typeof saved==="object" ? saved : START;
    this.coins=Number.isSafeInteger(input.coins) && input.coins>=0 ? input.coins : START.coins;
    this.items={};
    for(const item of CATALOG) {
      const count=input.items?.[item.id];
      if(Number.isSafeInteger(count) && count>0 && count<=99) this.items[item.id]=count;
    }
  }
  snapshot() {return {coins:this.coins,items:{...this.items}};}
  slots() {return Object.keys(this.items).length;}
  count(id) {return this.items[id]||0;}
  buy(id) {
    const item=ITEM_BY_ID[id];
    if(!item) return "Objet inconnu.";
    if(this.coins<item.price) return "Solde insuffisant.";
    if(!this.count(id) && this.slots()>=MAX_SLOTS) return "Le sac est plein.";
    if(this.count(id)>=99) return "Limite de 99 exemplaires atteinte.";
    this.coins-=item.price;
    this.items[id]=this.count(id)+1;
    return null;
  }
  sell(id) {
    const item=ITEM_BY_ID[id];
    if(!item || this.count(id)<1) return "Cet objet n'est pas dans le sac.";
    this.items[id]-=1;
    if(!this.items[id]) delete this.items[id];
    this.coins+=Math.floor(item.price/2);
    return null;
  }
}
