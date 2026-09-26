import {CATALOG,ITEM_BY_ID} from "./Economy.js";
const $ = selector => document.querySelector(selector);
const WORLD_EXTENT = 70;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export class GameUI {
  constructor({player, world, rig, renderer, save, settings, economy}) {
    Object.assign(this, {player, world, rig, renderer, save, settings, economy});
    this.active = null;
    this.destination = null;
    this.filter = "Toutes";
    this.query = "";
    this.selectedItem = null;
    this.lastFocus = null;
    this.body = $("#sheet-body");
    document.querySelectorAll("[data-panel]").forEach(button => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => this.open(button.dataset.panel));
    });
    $("#close-panel").addEventListener("click", () => this.close());
    $("#scrim").addEventListener("click", () => this.close());
    document.addEventListener("keydown", e => { if(e.key === "Escape") this.close(); });
    $("#camera-home").addEventListener("click", () => this.rig.home());
  }
  open(panel) {
    if(this.active === panel) return this.close();
    if(!["map","settings","menu","inventory","shop","quest"].includes(panel)) return;
    this.lastFocus = document.activeElement;
    this.active = panel;
    const titles = {
      map:["VAL-DES-BRUMES", "Carte locale"],
      settings:["PRÉFÉRENCES", "Réglages"],
      menu:["DYNASTY", "Menu principal"],
      inventory:["ÉQUIPEMENT DE VOYAGE", "Mon sac"],
      shop:["COMPTOIR DU VAL", "Boutique"],
      quest:["HISTOIRE PRINCIPALE", "Premiers pas"]
    };
    $("#sheet-kicker").textContent = titles[panel][0];
    $("#sheet-title").textContent = titles[panel][1];
    $("#sheet").hidden = $("#scrim").hidden = false;
    document.querySelectorAll("[data-panel]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.panel === panel)));
    this.render();
    this.flow?.action(panel);
    $("#close-panel").focus();
  }
  close() {
    if(!this.active) return;
    this.active = null;
    $("#sheet").hidden = $("#scrim").hidden = true;
    document.querySelectorAll("[data-panel]").forEach(b => b.setAttribute("aria-pressed", "false"));
    this.lastFocus?.focus?.();
  }
  render() {
    if(this.active === "quest") {
      const step=this.flow.quest.current();
      this.body.innerHTML=`<div class="panel-card"><h2>${step?step.title:"Initiation terminée"}</h2><p>${step?step.hint:"Vous connaissez désormais la carte, les habitants, le sac et la boutique."}</p><p class="note">Progression : ${this.flow.quest.step} / 6 étapes</p></div>`;
    }
    if(this.active === "menu") {
      this.body.innerHTML = `<div class="menu-balance"><span>Votre bourse</span><strong>✦ ${this.economy.coins} pièces</strong></div><div class="menu-links"><button type="button" data-jump="quest"><span>✧</span><strong>Quête principale</strong><small>Suivre l’initiation</small></button><button type="button" data-jump="map"><span>◇</span><strong>Carte</strong><small>Position et destinations</small></button><button type="button" data-jump="inventory"><span>▦</span><strong>Inventaire</strong><small>${this.economy.slots()} / 24 types d’objets</small></button><button type="button" data-jump="shop"><span>✧</span><strong>Boutique</strong><small>Achat et vente avec des pièces de jeu</small></button><button type="button" data-jump="settings"><span>⚙</span><strong>Réglages</strong><small>Caméra et affichage</small></button></div>`;
      this.body.querySelectorAll("[data-jump]").forEach(b => b.addEventListener("click",()=>this.open(b.dataset.jump)));
    }
    if(this.active === "inventory" || this.active === "shop") this.renderCommerce();
    if(this.active === "map") {
      this.destination = null;
      this.body.innerHTML = `<div class="panel-card"><h2>Votre position réelle dans le jeu</h2><div class="stat-row"><span>Région</span><strong>Val-des-Brumes</strong></div><div class="stat-row"><span>Est / ouest</span><strong id="stat-x"></strong></div><div class="stat-row"><span>Nord / sud</span><strong id="stat-z"></strong></div><p class="note">La position du personnage se met à jour pendant ses déplacements.</p></div><div class="map-wrap"><canvas id="local-map" width="480" height="480" aria-label="Carte locale : choisissez une destination"></canvas></div><div class="map-caption"><span>✦ Position · ◎ Destination</span><strong id="map-result" role="status">Touchez une zone libre</strong></div><div class="action-row"><button class="action secondary" type="button" id="travel" disabled>Tracer un trajet</button><button class="action" type="button" id="teleport" disabled>Se téléporter</button></div><p class="note">Le trajet suit une ligne droite. La téléportation fonctionne vers toute case praticable de cette région.</p>`;
      $("#local-map").addEventListener("click", e => this.mapTap(e));
      $("#travel").addEventListener("click", () => this.travel());
      $("#teleport").addEventListener("click", () => this.teleport());
      this.drawMap();
    }
    if(this.active === "settings") {
      this.body.innerHTML = `<div class="panel-card"><h2>Caméra</h2><label class="setting-label" for="distance">Distance <output id="distance-value"></output></label><input id="distance" type="range" min="12" max="29" step="1" value="${this.settings.distance}"><p class="setting-description">Ajuste immédiatement la distance de la vue suiveuse.</p></div><div class="panel-card"><h2>Affichage</h2><label class="setting-label" for="resolution">Résolution <output id="resolution-value"></output></label><input id="resolution" type="range" min="0.8" max="1.8" step="0.1" value="${this.settings.resolution}"><p class="setting-description">Réduisez-la si le monde 3D ralentit sur votre téléphone.</p></div><div class="panel-card"><h2>Exploration</h2><p>La caméra et les préférences restent enregistrées sur cet appareil.</p><div class="action-row"><button class="action secondary" type="button" id="reset-view">Recentrer la vue</button><button class="action secondary" type="button" id="return-village">Retour au village</button></div></div>`;
      const distance = $("#distance"), resolution = $("#resolution");
      const updateLabels = () => {
        $("#distance-value").textContent = `${distance.value} m`;
        $("#resolution-value").textContent = `${Math.round(Number(resolution.value)*100)} %`;
      };
      updateLabels();
      distance.addEventListener("input", () => { this.settings.distance=Number(distance.value); this.rig.dist=this.settings.distance; updateLabels(); this.persist(); });
      resolution.addEventListener("input", () => { this.settings.resolution=Number(resolution.value); this.applyResolution(); updateLabels(); this.persist(); });
      $("#reset-view").addEventListener("click", () => this.rig.home());
      $("#return-village").addEventListener("click", () => {
        this.player.target=null;
        this.player.group.position.set(0,this.world.height(0,12),12);
        this.rig.home();
        this.persist();
        this.close();
      });
    }
  }
  renderCommerce() {
    const shop=this.active === "shop";
    this.body.innerHTML = `<div class="commerce-top"><div class="currency"><span>✦</span><div><small>PIÈCES DE JEU</small><strong>${this.economy.coins}</strong></div></div><div class="slot-count">Sac <strong>${this.economy.slots()} / 24</strong></div></div>
      <div class="commerce-tabs" role="group" aria-label="Choisir une section"><button type="button" data-switch="inventory" ${shop?"":"aria-current=page"}>▦ Inventaire</button><button type="button" data-switch="shop" ${shop?"aria-current=page":""}>✧ Boutique</button></div>
      <div class="commerce-controls"><label class="search-field"><span aria-hidden="true">⌕</span><input id="item-search" type="search" placeholder="Rechercher un objet" aria-label="Rechercher un objet"></label><select id="item-category" aria-label="Catégorie"><option>Toutes</option><option>Exploration</option><option>Ressources</option><option>Curiosités</option></select></div>
      <div class="commerce-layout"><div><p class="section-label">${shop?"OBJETS EN VENTE":"OBJETS POSSÉDÉS"}</p><div class="item-grid" id="item-grid"></div><p class="commerce-hint">${shop?"Achat et revente avec monnaie fictive enregistrée sur cet appareil.":"Touchez un objet pour voir ses détails et le revendre."}</p></div><aside class="item-detail" id="item-detail" aria-live="polite"></aside></div>`;
    this.body.querySelectorAll("[data-switch]").forEach(b=>b.addEventListener("click",()=>this.open(b.dataset.switch)));
    $("#item-search").value=this.query;
    $("#item-category").value=this.filter;
    $("#item-search").addEventListener("input", e=>{this.query=e.target.value;this.renderItemGrid();});
    $("#item-category").addEventListener("change",e=>{this.filter=e.target.value;this.renderItemGrid();});
    this.renderItemGrid();
  }
  renderItemGrid() {
    const shop=this.active === "shop";
    const items=CATALOG.filter(i => (shop || this.economy.count(i.id)>0) && (this.filter === "Toutes" || i.category===this.filter) && i.name.toLocaleLowerCase("fr").includes(this.query.trim().toLocaleLowerCase("fr")));
    $("#item-grid").innerHTML=items.length ? items.map(i=>`<button class="item-cell" type="button" data-item="${i.id}" aria-label="${i.name}, ${shop?i.price+" pièces":this.economy.count(i.id)+" possédé(s)"}" ${this.selectedItem===i.id?"aria-current=true":""}><span class="item-glyph">${i.icon}</span><span class="item-count">${shop?i.price+" ✦":"×"+this.economy.count(i.id)}</span></button>`).join("") : `<p class="empty-items">${shop?"Aucun objet trouvé.":"Aucun objet dans cette catégorie."}</p>`;
    $("#item-grid").querySelectorAll("[data-item]").forEach(b=>b.addEventListener("click",()=>{
      this.selectedItem=b.dataset.item;
      this.renderItemGrid();
      if(this.active==="shop")this.flow?.action("shopItem");
      if(matchMedia("(max-width: 599px)").matches) $("#item-detail").scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
    }));
    this.renderItemDetail();
  }
  renderItemDetail(message="") {
    const item=ITEM_BY_ID[this.selectedItem];
    if(!item){$("#item-detail").innerHTML=`<div class="detail-placeholder"><span>✧</span><p>Sélectionnez un objet pour voir sa fiche.</p></div>`;return;}
    const owned=this.economy.count(item.id),shop=this.active === "shop";
    $("#item-detail").innerHTML=`<div class="detail-icon" aria-hidden="true">${item.icon}</div><span class="detail-category">${item.category}</span><h2>${item.name}</h2><p>${item.description}</p><div class="detail-stat"><span>Dans votre sac</span><strong>×${owned}</strong></div><div class="detail-stat"><span>Prix d'achat</span><strong>${item.price} ✦</strong></div><div class="detail-stat"><span>Prix de revente</span><strong>${Math.floor(item.price/2)} ✦</strong></div><button type="button" class="action purchase" id="buy-item" ${this.economy.coins<item.price || owned>=99 ? "disabled" : ""}>Acheter · ${item.price} ✦</button><button type="button" class="action secondary resale" id="sell-item" ${owned<1?"disabled":""}>Vendre 1 · +${Math.floor(item.price/2)} ✦</button><p class="commerce-feedback" id="commerce-feedback" role="status"></p>`;
    $("#buy-item").addEventListener("click",()=>this.trade("buy",item.id));
    $("#sell-item").addEventListener("click",()=>this.trade("sell",item.id));
    if(message) $("#commerce-feedback").textContent=message;
  }
  trade(action,id) {
    const error=action==="buy"?this.economy.buy(id):this.economy.sell(id);
    if(error){this.renderItemDetail(error);return;}
    this.persist();
    this.renderCommerce();
    this.renderItemDetail(action==="buy"?"Objet ajouté au sac.":"Objet vendu, pièces ajoutées.");
  }
  applyResolution() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.settings.resolution));
    this.renderer.setSize(innerWidth, innerHeight);
  }
  persist() { this.save.write({player:this.player.data(),settings:this.settings,economy:this.economy.snapshot(),...this.flow?.snapshot()}); }
  update() {
    const p = this.player.data();
    $("#coords").textContent = `${p.x.toFixed(0)}, ${p.z.toFixed(0)}`;
    if(this.active === "map") {
      $("#stat-x").textContent = p.x.toFixed(1);
      $("#stat-z").textContent = p.z.toFixed(1);
      this.drawMap();
    }
  }
  drawMap() {
    const canvas=$("#local-map");
    if(!canvas) return;
    const c=canvas.getContext("2d"), size=canvas.width;
    const toPx=n=>(n+WORLD_EXTENT)/(WORLD_EXTENT*2)*size;
    c.fillStyle="#385640";c.fillRect(0,0,size,size);
    c.fillStyle="#4d6646";
    for(let i=0;i<15;i++) for(let j=0;j<15;j++) {
      if(Math.hypot(i-7,j-7)<3.2) continue;
      c.beginPath();c.arc(i*34+8,j*34+4,8+(i*j)%8,0,Math.PI*2);c.fill();
    }
    c.strokeStyle="#c5aa7680";c.lineWidth=13;c.lineCap="round";
    c.beginPath();c.moveTo(toPx(-30),toPx(20));c.quadraticCurveTo(toPx(0),toPx(14),toPx(25),toPx(-20));c.stroke();
    for(const o of this.world.obstacles) {
      c.fillStyle="#d9bd82";c.strokeStyle="#263d35";c.lineWidth=3;
      c.beginPath();c.arc(toPx(o.x),toPx(o.z),Math.max(7,o.r*size/140),0,Math.PI*2);c.fill();c.stroke();
    }
    const p=this.player.data();
    c.fillStyle="#fff1bc";c.shadowColor="#f8df8d";c.shadowBlur=18;
    c.beginPath();c.arc(toPx(p.x),toPx(p.z),8,0,Math.PI*2);c.fill();
    c.shadowBlur=0;c.strokeStyle="#172821";c.lineWidth=3;c.stroke();
    if(this.destination) {
      c.strokeStyle="#f2d68d";c.lineWidth=3;
      c.beginPath();c.arc(toPx(this.destination.x),toPx(this.destination.z),12,0,Math.PI*2);c.stroke();
      c.fillStyle="#f2d68d";c.font="bold 14px sans-serif";
      c.fillText("◎",toPx(this.destination.x)-7,toPx(this.destination.z)+5);
    }
    c.fillStyle="#e7dbc0";c.font="600 15px sans-serif";c.fillText("VAL-DES-BRUMES",18,29);
    c.fillStyle="#d1bd8a";c.font="12px sans-serif";c.fillText("N ↑",size-45,28);
  }
  mapTap(e) {
    const canvas=$("#local-map"),r=canvas.getBoundingClientRect();
    const x=clamp((e.clientX-r.left)/r.width*140-70,-70,70);
    const z=clamp((e.clientY-r.top)/r.height*140-70,-70,70);
    if(!this.world.walkable(x,z)) {
      this.destination=null;
      $("#map-result").textContent="Zone inaccessible";
      $("#teleport").disabled=$("#travel").disabled=true;
      this.drawMap();return;
    }
    this.destination={x,z};
    $("#map-result").textContent=`Destination : ${x.toFixed(0)}, ${z.toFixed(0)}`;
    $("#teleport").disabled=$("#travel").disabled=false;
    this.drawMap();
  }
  travel() {
    if(!this.destination) return;
    const {x,z}=this.destination,origin=this.player.data();
    const distance=Math.hypot(x-origin.x,z-origin.z);
    const steps=Math.max(1,Math.ceil(distance/0.65));
    let clear=true;
    for(let i=1;i<=steps;i++) {
      const t=i/steps;
      if(!this.world.walkable(origin.x+(x-origin.x)*t,origin.z+(z-origin.z)*t)){clear=false;break;}
    }
    $("#map-result").textContent=clear?"Trajet lancé":"Chemin bloqué : utilisez la téléportation ou choisissez un autre point";
    if(clear) {this.player.moveTo(x,z);this.close();}
  }
  teleport() {
    if(!this.destination || !this.world.walkable(this.destination.x,this.destination.z)) return;
    this.player.target=null;
    const {x,z}=this.destination;
    this.player.group.position.set(x,this.world.height(x,z),z);
    this.persist();
    this.close();
  }
}
