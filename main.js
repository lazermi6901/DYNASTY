import * as THREE from "three";
import {World} from "./World.js";
import {Player} from "./Player.js";
import {CameraRig} from "./Camera.js";
import {Save} from "./Save.js";
import {GameUI} from "./UI.js";
import {Economy} from "./Economy.js";
import {NPCSystem} from "./NPC.js";
import {GameFlow} from "./GameFlow.js";
const host=document.querySelector("#world"),scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bb5b2);
scene.fog=new THREE.Fog(0x9bb5b2,45,115);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,250);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd7e7ff,0x493b29,2.3));
const sun=new THREE.DirectionalLight(0xffedc2,2.4);
sun.position.set(30,55,20);scene.add(sun);
const world=new World(scene),save=new Save(),saved=save.load();
const start=saved?.player && Number.isFinite(saved.player.x) && Number.isFinite(saved.player.z) && world.walkable(saved.player.x,saved.player.z) ? saved.player : {x:0,z:12};
const player=new Player(scene,world,start);
const rig=new CameraRig(camera,renderer.domElement,player);
const settings={distance:Math.max(12,Math.min(29,Number(saved?.settings?.distance)||18)),resolution:Math.max(.8,Math.min(1.8,Number(saved?.settings?.resolution)||1.4))};
rig.dist=settings.distance;
const economy=new Economy(saved?.economy);
const ui=new GameUI({player,world,rig,renderer,save,settings,economy});
const npcs=new NPCSystem(scene,world);
const flow=new GameFlow({player,npcs,ui,saved});
ui.flow=flow;
ui.applyResolution();
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
let down=null;
renderer.domElement.addEventListener("pointerdown",e=>down={x:e.clientX,y:e.clientY});
renderer.domElement.addEventListener("pointerup",e=>{
  if(!flow.started || !document.querySelector("#dialogue").hidden)return;
  if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8) return;
  const r=renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(pointer,camera);
  const npc=npcs.hit(ray);
  if(npc){flow.talk(npc);return;}
  const h=ray.intersectObject(world.ground)[0];
  if(h)player.moveTo(h.point.x,h.point.z);
});
function persist(){ui.persist();}
setInterval(persist,4000);
addEventListener("visibilitychange",()=>document.hidden&&persist());
addEventListener("pagehide",persist);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();ui.applyResolution()});
let last=performance.now(),lastUi=0;
renderer.setAnimationLoop(now=>{
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(flow.started)player.update(dt);
  rig.update();npcs.animate(now/1000);
  if(now-lastUi>120){ui.update();flow.tick();lastUi=now;}
  renderer.render(scene,camera);
});
