import * as THREE from "three";
export const NPCS=[
  {id:"mira",name:"Mira",role:"Guide du village",x:4,z:9,body:0x9f6652,cloak:0x557e70,accent:0xf3d98c},
  {id:"oren",name:"Oren",role:"Cartographe",x:-7,z:12,body:0x6d89a1,cloak:0x764f66,accent:0xc6e0f2},
  {id:"tala",name:"Tala",role:"Marchande",x:8,z:-6,body:0xc39066,cloak:0x755c39,accent:0xe6c77b}
];
export class NPCSystem {
  constructor(scene,world){
    this.people=NPCS.map(def=>{
      const root=new THREE.Group();
      root.position.set(def.x,world.height(def.x,def.z),def.z);
      const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.87});
      const body=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.25,5,8),mat(def.body));
      body.position.y=1.55;
      const cloak=new THREE.Mesh(new THREE.ConeGeometry(.9,1.65,6),mat(def.cloak));
      cloak.position.set(0,1.2,.42);cloak.rotation.x=Math.PI;
      const head=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),mat(0xe0b18e));
      head.position.y=2.75;
      const sign=new THREE.Mesh(new THREE.OctahedronGeometry(.35),new THREE.MeshStandardMaterial({color:def.accent,emissive:def.accent,emissiveIntensity:.45}));
      sign.position.y=3.6;
      const hit=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,3.8,8),new THREE.MeshBasicMaterial({visible:false}));
      hit.position.y=1.9;
      root.add(body,cloak,head,sign,hit);
      root.traverse(obj=>{obj.userData.npcId=def.id;});
      scene.add(root);
      return {...def,root,sign,body};
    });
  }
  hit(ray){for(const p of this.people){if(ray.intersectObject(p.root,true).length)return p;}return null;}
  nearest(x,z,range=6){return this.people.find(p=>Math.hypot(x-p.x,z-p.z)<range)??null;}
  animate(seconds){for(const [i,p] of this.people.entries()){p.sign.position.y=3.6+Math.sin(seconds*2.2+i)*.12;p.sign.rotation.y+=.02;p.body.rotation.z=Math.sin(seconds*1.5+i)*.025;}}
}
