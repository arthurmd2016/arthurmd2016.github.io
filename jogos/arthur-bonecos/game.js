import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createColorControls } from './color-controls.js';
import { createArcade } from './arcade.js';
import { createSocialArcade } from './social-arcade.js';

const $ = id => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9d9f0');
scene.fog = new THREE.Fog('#a9d9f0', 140, 420);
scene.add(new THREE.HemisphereLight(0xffffff, 0x53664b, 2.5));
const sun = new THREE.DirectionalLight(0xfff2d9, 3);
sun.position.set(50, 100, 60); scene.add(sun);
const camera = new THREE.PerspectiveCamera(55, 1, .1, 700);
const keys = new Set(), touch = new Map(), obstacles = [];
const actor = new THREE.Group(); scene.add(actor);
let ready = false, playing = false, loading = false;
let yaw = 0, pitch = .35, zoom = 30, last = 0, drag = null, bounds;
let cityWorld, roomWorld, roomBounds, outside, indoors=false, entering=false, nearest=null;
let chosenColor='#1579ff', previousColor=chosenColor;
let redPortal, portalArmed=true;
const arcade=createArcade(()=>chosenColor,()=>{resetControls();portalArmed=false;},()=>window.arthurOnline?.players||[]);
const socialArcade=createSocialArcade(arcade,resetControls);
window.arthurJoinMinigame=(type,required)=>{resetControls();if(socialArcade.has(type))socialArcade.join(type,required);else arcade.join(type,required);};
try { const saved=localStorage.getItem('arthur-bonecos-color'); if(/^#[0-9a-f]{6}$/i.test(saved))chosenColor=saved; } catch {}
const bots=[];
const onlinePlayers=new Map();
function onlineNameLabel(name){
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=64;const pen=canvas.getContext('2d');
  pen.fillStyle='#10243dcc';pen.roundRect(2,2,316,60,18);pen.fill();pen.fillStyle='white';pen.font='bold 30px sans-serif';pen.textAlign='center';pen.fillText(name,160,42);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));sprite.position.set(0,12,0);sprite.scale.set(10,2,1);sprite.userData.onlineName=true;return sprite;
}
const places=[], raycaster=new THREE.Raycaster();
const visited = new Set(), companions = new THREE.Group();
scene.add(companions);
let mano, portal, quest=0, missionDone=false, questPaused=false, climb=null, rooftop=null, climbPlace=null;
const challenges=[
 {text:'Converse com Mano',type:'talk'},
 {text:'Entre em 3 prédios diferentes',type:'buildings',count:3},
 {text:'Vá ao portal com o boneco vermelho',type:'portal',color:'red'},
 {text:'Entre em 4 prédios diferentes',type:'buildings',count:4},
 {text:'Escale um prédio até o telhado',type:'climb'},
 {text:'Vá ao portal com o boneco verde',type:'portal',color:'green'}
];
function advanceQuest(){if(questPaused)return;visited.clear();quest++;missionDone=quest>=challenges.length;if(portal)portal.visible=!missionDone&&challenges[quest].type==='portal';questText();}
function colorMatches(kind){const [r,g,b]=chosenColor.slice(1).match(/../g).map(v=>parseInt(v,16));return kind==='red'?r>100&&r>g*1.4&&r>b*1.4:g>80&&g>r*1.3&&g>b*1.2;}
function questText(){
  const task=challenges[quest];
  $('quest').textContent=missionDone?'Todos os desafios concluídos!':(questPaused?'Desafio parado · clique em Continuar desafio':('Desafio '+(quest+1)+' · '+task.text+(task.type==='buildings'?' ('+visited.size+'/'+task.count+')':'')));
}
function talk(){
  if(questPaused){$('interactionStatus').textContent='O desafio está parado. Clique em Continuar desafio.';return;}
  if(quest===0)advanceQuest();
  const text=missionDone?'Mano: Parabéns! Você completou todos os desafios!':'Mano: Seu desafio agora é: '+challenges[quest].text+'. Você consegue!';
  $('interactionStatus').textContent=text;questText();
  if(window.speechSynthesis&&window.SpeechSynthesisUtterance){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(text);voice.lang='pt-BR';speechSynthesis.speak(voice);}
}
function resize() {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  // CSS owns the canvas size, avoiding a stale landscape width on mobile rotation.
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
async function load() {
  // All five supplied GLBs are identical full-scene exports. Load once,
  // retaining their existing duplicated buildings and clothing shops.
  const gltf = await new GLTFLoader().loadAsync('./BONECO.glb');
  const world = gltf.scene;
  cityWorld=world;
  world.updateMatrixWorld(true);
  const bone = world.getObjectByName('Icosphere');
  const ground = world.getObjectByName('TERRA');
  if (!bone || !ground) throw new Error('Boneco ou chão não encontrados no GLB.');
  const model = bone.clone(true);
  model.applyMatrix4(bone.parent.matrixWorld);
  bone.removeFromParent();
  const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
  const visual = new THREE.Group(); visual.add(model);
  model.position.sub(new THREE.Vector3((box.min.x+box.max.x)/2,box.min.y,(box.min.z+box.max.z)/2));
  visual.scale.setScalar(8 / Math.max(size.y, .01));
  model.traverse(mesh => { if (mesh.isMesh) mesh.material = new THREE.MeshStandardMaterial({ color: chosenColor, roughness: .65, metalness: .05 }); });
  actor.add(visual);
  scene.add(world); world.updateMatrixWorld(true);
  bounds = new THREE.Box3().setFromObject(ground);
  actor.position.set(-10, bounds.max.y + .08, -10);
  world.traverse(mesh => {
    if (!mesh.isMesh) return;
    if (/^(PREDIO|ROUPAS)/.test(mesh.name)) {
      const box=new THREE.Box3().setFromObject(mesh).expandByScalar(1.4);
      obstacles.push(box); places.push({mesh,box,shop:mesh.name.startsWith('ROUPAS')});
    }
    // Preserve the exported colors and make the thin signs visible from either side.
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.side = THREE.DoubleSide;
  });
  // Find an open spawn without moving or replacing any of the supplied scenery.
  for (let z=-10; z<130; z+=10) {
    const position = new THREE.Vector3(-10,actor.position.y,z);
    if (!blocked(position)) { actor.position.copy(position); break; }
  }
  ready = true;
  mano=actor.clone(true);
  mano.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.set('#ffb347');m.userData.mano=true;}});
  mano.position.copy(actor.position).add(new THREE.Vector3(9,0,-9));
  // Keep the guide and the portal on open ground near the starting point.
  for(let z=actor.position.z-12;z<bounds.max.z-10;z+=8){const p=new THREE.Vector3(actor.position.x+9,actor.position.y,z);if(!blocked(p)){mano.position.copy(p);break;}}
  companions.add(mano);
  const signCanvas=document.createElement('canvas');signCanvas.width=256;signCanvas.height=64;
  const pen=signCanvas.getContext('2d');pen.fillStyle='#172e48';pen.fillRect(0,0,256,64);pen.fillStyle='white';pen.font='bold 36px sans-serif';pen.textAlign='center';pen.fillText('MANO',128,46);
  const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(signCanvas)}));sign.position.set(0,11,0);sign.scale.set(9,2.25,1);sign.userData.mano=true;mano.add(sign);
  portal=new THREE.Mesh(new THREE.TorusGeometry(5,.55,12,48),new THREE.MeshStandardMaterial({color:0x55ffad,emissive:0x22bb66,emissiveIntensity:1}));
  portal.position.copy(actor.position).add(new THREE.Vector3(0,5,12));
  for(let z=actor.position.z+12;z<bounds.max.z-8;z+=8){const p=new THREE.Vector3(actor.position.x,actor.position.y,z);if(!blocked(p)){portal.position.set(p.x,p.y+5,p.z);break;}}
  portal.visible=false;companions.add(portal);restoreQuest();portal.visible=!missionDone&&challenges[quest]?.type==='portal';questText();
  redPortal=new THREE.Mesh(new THREE.TorusGeometry(5,.55,12,48),new THREE.MeshStandardMaterial({color:0xff334d,emissive:0xaa1025,emissiveIntensity:1}));
  let portalSpot=null;
  for(let radius=12;radius<=80&&!portalSpot;radius+=4){
    for(let i=0;i<16;i++){
      const angle=i*Math.PI/8,p=mano.position.clone().add(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));
      const footprint=new THREE.Box3(new THREE.Vector3(p.x-6,bounds.min.y-1,p.z-3),new THREE.Vector3(p.x+6,bounds.max.y+12,p.z+3));
      if(p.x<bounds.min.x+7||p.x>bounds.max.x-7||p.z<bounds.min.z+7||p.z>bounds.max.z-7)continue;
      if(obstacles.some(box=>box.intersectsBox(footprint))||Math.hypot(p.x-portal.position.x,p.z-portal.position.z)<12)continue;
      portalSpot=p;break;
    }
  }
  if(!portalSpot)throw Error('Não foi encontrado espaço livre para o portal perto do Mano.');
  redPortal.position.copy(portalSpot).add(new THREE.Vector3(0,5,0));
  companions.add(redPortal);
  configureBots();
  $('hint').textContent='Portal vermelho: minigames · W/A/D e setas · Espaço: pular · S: agachar · Arraste para olhar';
}
function blocked(position) {
  if(indoors)return false;
  return obstacles.some(box => position.x>box.min.x && position.x<box.max.x && position.z>box.min.z && position.z<box.max.z);
}
function showMenu() { $('quest').hidden=true; $('questButtons').hidden=true; $('quickChat').hidden=true; $('climb').hidden=true; if(window.speechSynthesis)speechSynthesis.cancel(); playing=false; resetControls(); $('interact').hidden=true; $('cover').hidden=false; $('controls').hidden=true; $('hint').hidden=true; $('menu').hidden=true; }
function setColor(hex){chosenColor=hex;actor.traverse(m=>{if(m.isMesh&&!m.userData.fixedColor)m.material.color.set(hex);});}
const renderColorControls = createColorControls();
function syncColor(hex){
  setColor(hex);$('colorPicker').value=hex;$('hexColor').value=hex;$('hexColor').setCustomValidity('');
  const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255),max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min;
  let hue=0;if(delta){const [r,g,b]=rgb;hue=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;hue=(hue*60+360)%360;}
  $('hue').value=hue;$('saturation').value=max?delta/max*100:0;$('value').value=max*100;renderColorControls();
}
function openColors(){if(entering)return;previousColor=chosenColor;resetControls();syncColor(chosenColor);$('colors').showModal();}
$('colorPicker').addEventListener('input',e=>syncColor(e.target.value));
$('hexColor').addEventListener('input',e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value))syncColor(e.target.value);else e.target.setCustomValidity('Use # e seis dígitos, como #1579ff.');});
for(const id of ['hue','saturation','value'])$(id).addEventListener('input',()=>{
  const h=Number($('hue').value)/60,s=Number($('saturation').value)/100,v=Number($('value').value)/100;
  const c=v*s,x=c*(1-Math.abs(h%2-1)),m=v-c;
  const rgb=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h)%6];
  const hex='#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('');
  setColor(hex);$('colorPicker').value=hex;$('hexColor').value=hex;$('hexColor').setCustomValidity('');renderColorControls();
});
$('saveColor').addEventListener('click',()=>{if(!$('hexColor').reportValidity())return;try{localStorage.setItem('arthur-bonecos-color',chosenColor);}catch{}$('colors').close();});
$('cancelColor').addEventListener('click',()=>{setColor(previousColor);$('colors').close();});
$('colors').addEventListener('cancel',()=>setColor(previousColor));
async function enterRoom(place=nearest){
  if(entering||indoors||climb||rooftop)return;entering=true;resetControls();$('interactionStatus').textContent='Abrindo o quarto…';
  try{
    if(!roomWorld){
      const loader=new GLTFLoader();
      const [roomFile,doorFile]=await Promise.all([loader.loadAsync('./quarto.glb'),loader.loadAsync('./porta-do-quarto.glb')]);
      const room=roomFile.scene.getObjectByName('quarto'),door=doorFile.scene.getObjectByName('porta');
      if(!room||!door)throw Error('Quarto ou porta não encontrado.');
      const group=new THREE.Group();group.add(room.clone(true),door.clone(true));group.scale.setScalar(1.6);
      group.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.side=THREE.DoubleSide;}});
      group.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(group);
      group.position.y=-box.min.y;group.updateMatrixWorld(true);roomBounds=new THREE.Box3().setFromObject(group);
      scene.add(group);roomWorld=group;roomWorld.visible=false;
    }
    outside={position:actor.position.clone(),bounds:bounds.clone(),yaw,pitch,zoom};
    cityWorld.visible=false;companions.visible=false;roomWorld.visible=true;indoors=true;bounds=roomBounds;
    actor.scale.setScalar(1);actor.position.set((bounds.min.x+bounds.max.x)/2, .12,(bounds.min.z+bounds.max.z)/2);
    yaw=0;pitch=.18;zoom=6;scene.fog=null;scene.background.set('#c1af9e');
    if(!questPaused&&!missionDone&&challenges[quest].type==='buildings'&&place&&!place.shop){visited.add(place.mesh.name);if(visited.size>=challenges[quest].count)advanceQuest();else questText();}
    $('interactionStatus').textContent='Você entrou no quarto. Clique em Sair do quarto para voltar.';
  }catch(error){$('interactionStatus').textContent='Não foi possível abrir o quarto. Tente novamente.';console.error(error);}
  finally{entering=false;}
}
function leaveRoom(){
  if(!indoors)return;indoors=false;roomWorld.visible=false;cityWorld.visible=true;companions.visible=true;
  actor.scale.setScalar(1);actor.position.copy(outside.position);bounds=outside.bounds;({yaw,pitch,zoom}=outside);
  scene.fog=new THREE.Fog('#a9d9f0',140,420);scene.background.set('#a9d9f0');$('interactionStatus').textContent='';resetControls();
}
$('interact').addEventListener('click',()=>{if(indoors)leaveRoom();else if(nearest?.mano)talk();else if(nearest?.shop)openColors();else if(nearest)void enterRoom();});
$('start').addEventListener('click', async () => {
  if (loading) return;
  loading=true; $('start').disabled=true;
  try {
    if (!ready) { $('status').textContent='Carregando seu boneco e a cidade…'; await load(); }
    playing=true; $('cover').hidden=true; $('controls').hidden=false; $('hint').hidden=false; $('menu').hidden=false;
    $('quest').hidden=false;$('questButtons').hidden=false;$('quickChat').hidden=false;questText();
    $('start').textContent='Continuar'; $('status').textContent='W/A/D e setas para andar; S: agachar; Espaço: pular · Arraste para olhar';
  } catch(error) { $('status').textContent='Não foi possível carregar os modelos. Abra pelo Live Server e tente novamente.'; console.error(error); }
  finally { loading=false; $('start').disabled=false; }
});
$('menu').addEventListener('click',showMenu);
function saveQuest(){
  try{localStorage.setItem('arthur-bonecos-challenge',JSON.stringify({quest,missionDone,questPaused,visited:[...visited]}));$('interactionStatus').textContent='Desafio salvo neste aparelho!';}
  catch{$('interactionStatus').textContent='Não foi possível salvar neste navegador.';}
}
function restoreQuest(){
  try{const data=JSON.parse(localStorage.getItem('arthur-bonecos-challenge'));if(!data||!Number.isInteger(data.quest))return;quest=Math.max(0,Math.min(challenges.length,data.quest));missionDone=Boolean(data.missionDone)||quest>=challenges.length;questPaused=Boolean(data.questPaused);visited.clear();for(const name of data.visited||[])visited.add(name);$('pauseQuest').textContent=questPaused?'Continuar desafio':'Parar desafio';}catch{}
}
$('pauseQuest').addEventListener('click',()=>{if(missionDone)return;questPaused=!questPaused;$('pauseQuest').textContent=questPaused?'Continuar desafio':'Parar desafio';questText();$('interactionStatus').textContent=questPaused?'Desafio parado. Seu progresso continua guardado.':'Desafio continuado!';});
$('saveQuest').addEventListener('click',saveQuest);
const stick = $('joystick'), stickHandle = $('joystickStick');
let stickPointer = null, stickX = 0, stickY = 0;
let jumpHeight = 0, jumpVelocity = 0, jumpHeld = false;
function resetControls(){
  keys.clear();touch.clear();stickPointer=null;stickX=stickY=0;
  stickHandle.style.transform='translate(0px, 0px)';
  jumpHeight=jumpVelocity=0;jumpHeld=false;
}
function moveStick(e){
  if(e.pointerId!==stickPointer)return;
  const rect=stick.getBoundingClientRect(),radius=rect.width*.32;
  let x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;
  const length=Math.hypot(x,y),scale=Math.min(1,radius/(length||1));x*=scale;y*=scale;
  stickHandle.style.transform=`translate(${x}px, ${y}px)`;
  const magnitude=Math.hypot(x,y)/radius;
  const strength=Math.max(0,(magnitude-.15)/.85);
  stickX=magnitude?x/radius/magnitude*strength:0;stickY=magnitude?y/radius/magnitude*strength:0;
}
stick.addEventListener('pointerdown',e=>{
  if(stickPointer!==null||!playing||entering||arcade.open)return;
  e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);
});
stick.addEventListener('pointermove',moveStick);
for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,e=>{
  if(e.pointerId!==stickPointer)return;
  stickPointer=null;stickX=stickY=0;stickHandle.style.transform='translate(0px, 0px)';
});
const mapping={' ':'Jump',w:'ArrowUp',s:'Crouch',a:'ArrowLeft',d:'ArrowRight'};
addEventListener('keydown',e=>{if(worldInputBlocked())return;if(e.key==='Escape'){showMenu();return;} if(!playing||entering)return; const key=mapping[e.key.toLowerCase()]||e.key;if(key.startsWith('Arrow')||key==='Crouch'||key==='Jump'){e.preventDefault();keys.add(key);}});
addEventListener('keyup',e=>keys.delete(mapping[e.key.toLowerCase()]||e.key));
addEventListener('blur',()=>{resetControls();drag=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!arcade.open&&!socialArcade.open)showMenu();});
document.querySelectorAll('[data-key]').forEach(button=>{
  button.addEventListener('pointerdown',e=>{if(!playing||entering||arcade.open)return;e.preventDefault();button.setPointerCapture(e.pointerId);touch.set(e.pointerId,button.dataset.key);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>touch.delete(e.pointerId));
});
$('world').addEventListener('pointerdown',e=>{if(!playing||entering)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0};$('world').setPointerCapture(e.pointerId);});
$('world').addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;drag.moved+=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);yaw-=(e.clientX-drag.x)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.12,1.05);drag.x=e.clientX;drag.y=e.clientY;});
$('world').addEventListener('pointerup',e=>{
  if(!drag||drag.moved>8||!playing||indoors||entering||climb||rooftop)return;
  const rect=$('world').getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
  const hit=raycaster.intersectObjects([...places.map(p=>p.mesh),mano],true)[0];
  if(hit?.object.userData.mano){talk();return;}
  const place=hit&&places.find(p=>p.mesh===hit.object);
  if(place?.shop)openColors();
  else if(place){if(place.box.distanceToPoint(actor.position)<12)void enterRoom(place);else $('interactionStatus').textContent='Aproxime-se do prédio para entrar.';}
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('world').addEventListener(event,()=>drag=null);
$('world').addEventListener('wheel',e=>{if(!playing)return;e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.025,indoors?5:16,indoors?12:65);},{passive:false});
$('climb').addEventListener('click',()=>{
 if(!playing||indoors||climb)return;
 resetControls();
 if(rooftop){climb={from:actor.position.clone(),to:rooftop.clone(),ground:rooftop.clone(),elapsed:0,down:true};rooftop=null;}
 else if(climbPlace){const roof=climbPlace.box.getCenter(new THREE.Vector3());roof.y=climbPlace.box.max.y-1.3;climb={from:actor.position.clone(),to:roof,ground:actor.position.clone(),elapsed:0,down:false};}
});

function configureBots(){
  for(const bot of bots){companions.remove(bot.mesh);bot.mesh.traverse(m=>{if(m.isMesh)m.material.dispose();});}bots.length=0;
  if(!ready)return;
  const area=indoors?outside.bounds:bounds, origin=indoors?outside.position:actor.position;
  for(let i=0;i<0;i++){
    const mesh=actor.clone(true);mesh.scale.setScalar(1);mesh.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.setHSL(i/9,.7,.55);}});
    let spot=null;
    for(let n=0;n<300;n++){const p=new THREE.Vector3(THREE.MathUtils.clamp(origin.x+(Math.random()-.5)*90,area.min.x+5,area.max.x-5),area.max.y+.08,THREE.MathUtils.clamp(origin.z+(Math.random()-.5)*90,area.min.z+5,area.max.z-5));if(!obstacles.some(b=>p.x>b.min.x&&p.x<b.max.x&&p.z>b.min.z&&p.z<b.max.z)){spot=p;break;}}
    if(!spot)spot=origin.clone();mesh.position.copy(spot);companions.add(mesh);bots.push({mesh,heading:Math.random()*Math.PI*2,timer:0});
  }
}
addEventListener('arthur-online-players',event=>{
  if(!ready)return;
  const active=new Set();
  for(const player of event.detail.players){
    if(player.id===event.detail.self){if(!actor.children.some(child=>child.userData.onlineName))actor.add(onlineNameLabel(player.name));continue;}active.add(player.id);
    let remote=onlinePlayers.get(player.id);
    if(!remote){const mesh=actor.clone(true);mesh.scale.setScalar(1);for(const label of mesh.children.filter(child=>child.userData.onlineName))mesh.remove(label);mesh.add(onlineNameLabel(player.name));mesh.traverse(m=>{if(m.isMesh){m.material=m.material.clone();}});mesh.position.set(player.x,actor.position.y,player.z);remote={mesh,target:mesh.position.clone()};companions.add(mesh);onlinePlayers.set(player.id,remote);}
    remote.mesh.traverse(m=>{if(m.isMesh&&!m.userData.fixedColor)m.material.color.set(player.color||'#1579ff');});
    remote.name=player.name;remote.mesh.visible=!player.game;remote.target.set(player.x,(indoors?outside.bounds:bounds).max.y+.08,player.z);
  }
  for(const [id,remote] of onlinePlayers)if(!active.has(id)){companions.remove(remote.mesh);onlinePlayers.delete(id);}
});
let pendingFriend=null;
addEventListener('arthur-find-player',event=>{
  pendingFriend=event.detail.id;
  if(arcade.open)document.getElementById('arcade').close();
  if(!playing)$('start').click();
});
function findFriend(){
  if(!pendingFriend||!ready||!playing||entering)return;
  const friend=window.arthurOnline?.players.find(p=>p.id===pendingFriend);
  pendingFriend=null;
  if(!friend){$('interactionStatus').textContent='Essa pessoa saiu. Confira a lista em Pessoas.';return;}
  if(friend.game){$('interactionStatus').textContent=friend.name+' está nos minigames. Entre pelo portal vermelho para jogar junto.';return;}
  leaveRoom();climb=null;rooftop=null;resetControls();
  const ground=bounds.max.y+.08;
  let destination=null;
  for(const radius of [7,11,16]){
    for(let i=0;i<16;i++){
      const angle=i*Math.PI/8;
      const p=new THREE.Vector3(friend.x+Math.cos(angle)*radius,ground,friend.z+Math.sin(angle)*radius);
      if(p.x>bounds.min.x+4&&p.x<bounds.max.x-4&&p.z>bounds.min.z+4&&p.z<bounds.max.z-4&&!blocked(p)){destination=p;break;}
    }
    if(destination)break;
  }
  if(!destination){$('interactionStatus').textContent='Não há espaço livre perto dessa pessoa. Tente quando ela estiver na rua.';return;}
  actor.position.copy(destination);yaw=0;pitch=.35;zoom=30;portalArmed=false;
  $('interactionStatus').textContent='Você chegou perto de '+friend.name+'! Procure o nome acima do boneco.';
}
function worldInputBlocked(){return !!document.querySelector('dialog[open]')||!!document.activeElement?.closest('input,textarea,select,[contenteditable=true]');}
new MutationObserver(()=>{if(worldInputBlocked())resetControls();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
function updateBots(dt){
  if(!playing||indoors||arcade.open||entering)return;
  for(const bot of bots){bot.timer-=dt;if(bot.timer<=0){bot.heading=Math.random()*Math.PI*2;bot.timer=1+Math.random()*3;}
    const p=bot.mesh.position.clone();p.x+=Math.sin(bot.heading)*8*dt;p.z+=Math.cos(bot.heading)*8*dt;
    if(blocked(p)||p.x<bounds.min.x+5||p.x>bounds.max.x-5||p.z<bounds.min.z+5||p.z>bounds.max.z-5){bot.timer=0;continue;}
    bot.mesh.position.copy(p);bot.mesh.rotation.y=bot.heading;
  }
}

function frame(time){
  const dt=Math.min((time-last)/1000||0,.04);last=time;findFriend();updateBots(dt);
  const crouched=playing&&!arcade.open&&!entering&&!climb&&!worldInputBlocked()&&(keys.has('Crouch')||[...touch.values()].includes('Crouch'));
  actor.scale.y=THREE.MathUtils.lerp(actor.scale.y,crouched?.58:1,Math.min(1,dt*18));
  for(const remote of onlinePlayers.values()){const dx=remote.target.x-remote.mesh.position.x,dz=remote.target.z-remote.mesh.position.z;if(Math.hypot(dx,dz)>.01)remote.mesh.rotation.y=Math.atan2(dx,dz);remote.mesh.position.lerp(remote.target,1-Math.exp(-28*dt));}
  if(window.arthurOnline&&ready){window.arthurOnline.position={x:(indoors?outside.position:actor.position).x,z:(indoors?outside.position:actor.position).z,color:chosenColor};}
  if(playing&&!arcade.open&&climb){
    climb.elapsed+=dt;const p=Math.min(1,climb.elapsed/2.5);
    // Rise along the wall first, then step onto the roof.
    const vertical=climb.down?Math.max(0,(p-.2)/.8):Math.min(1,p/.8),horizontal=climb.down?Math.min(1,p/.2):Math.max(0,(p-.8)/.2);
    actor.position.copy(climb.from);actor.position.y=THREE.MathUtils.lerp(climb.from.y,climb.to.y,vertical);
    actor.position.x=THREE.MathUtils.lerp(climb.from.x,climb.to.x,horizontal);actor.position.z=THREE.MathUtils.lerp(climb.from.z,climb.to.z,horizontal);
    if(p===1){if(!climb.down){rooftop=climb.ground;if(!questPaused&&!missionDone&&challenges[quest].type==='climb')advanceQuest();}climb=null;resetControls();}
  }
  if(playing&&ready&&!arcade.open&&!entering&&!climb&&!rooftop&&!worldInputBlocked()){
    const down=key=>keys.has(key)||[...touch.values()].includes(key);
    const direction=new THREE.Vector3(Number(down('ArrowRight'))-Number(down('ArrowLeft'))+stickX,0,Number(down('ArrowDown'))-Number(down('ArrowUp'))+stickY);
    if(direction.lengthSq()){
      direction.clampLength(0,1).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
      actor.rotation.y=Math.atan2(direction.x,direction.z);
      for(const axis of ['x','z']){
        const candidate=actor.position.clone();candidate[axis]+=direction[axis]*(indoors?8:20)*(crouched?.5:1)*dt;
        candidate[axis]=THREE.MathUtils.clamp(candidate[axis],bounds.min[axis]+4,bounds.max[axis]-4);
        if(!blocked(candidate))actor.position.copy(candidate);
        else if(!indoors){const building=places.find(p=>!p.shop&&candidate.x>p.box.min.x&&candidate.x<p.box.max.x&&candidate.z>p.box.min.z&&candidate.z<p.box.max.z);if(building){void enterRoom(building);break;}}
      }
    }
  }
  if(playing&&ready&&!arcade.open){
    nearest=null;let distance=12;
    if(!indoors)for(const place of places){const d=place.box.distanceToPoint(actor.position);if(d<distance){distance=d;nearest=place;}}
    if(!indoors&&mano.position.distanceTo(actor.position)<12)nearest={mano:true};
    $('interact').hidden=entering||$('colors').open||(!indoors&&!nearest);
    $('interact').textContent=indoors?'Sair do quarto':nearest?.mano?'Conversar com Mano':nearest?.shop?'Escolher cor':'Entrar no prédio';
    if(!indoors&&!climb&&!rooftop&&!questPaused&&!missionDone&&challenges[quest].type==='portal'&&Math.hypot(actor.position.x-portal.position.x,actor.position.z-portal.position.z)<4){
      if(colorMatches(challenges[quest].color)){advanceQuest();$('interactionStatus').textContent=missionDone?'Parabéns! Todos os desafios completos!':'Desafio cumprido! Veja o próximo objetivo.';}
      else $('interactionStatus').textContent='Troque a cor na loja: este portal pede '+(challenges[quest].color==='red'?'vermelho.':'verde.');
    }
    climbPlace=null;let climbDistance=12;
    if(!indoors&&!rooftop)for(const place of places){const d=place.box.distanceToPoint(actor.position);if(!place.shop&&d<climbDistance){climbPlace=place;climbDistance=d;}}
    $('climb').hidden=indoors||entering||Boolean(climb)||$('colors').open||(!rooftop&&!climbPlace);
    $('climb').textContent=rooftop?'Descer do prédio':'Escalar prédio';
    if(climb||rooftop)$('interact').hidden=true;
  }
  if(ready&&playing&&!indoors&&!entering&&!climb&&!rooftop&&!arcade.open){
    const distance=Math.hypot(actor.position.x-redPortal.position.x,actor.position.z-redPortal.position.z);
    if(distance>7)portalArmed=true;
    if(distance<4&&portalArmed&&!$('colors').open){resetControls();drag=null;arcade.show();}
  }
  const canJump=playing&&ready&&!arcade.open&&!entering&&!climb&&!rooftop&&!worldInputBlocked();
  const jumpPressed=keys.has('Jump')||[...touch.values()].includes('Jump');
  if(canJump){
    if(jumpPressed&&!jumpHeld&&jumpHeight===0)jumpVelocity=13;
    jumpVelocity-=32*dt;jumpHeight=Math.max(0,jumpHeight+jumpVelocity*dt);
    if(jumpHeight===0)jumpVelocity=0;
  }else{jumpHeight=jumpVelocity=0;}
  jumpHeld=jumpPressed;
  // Keep collision, room entrances and online ground coordinates stable while rendering the jump.
  actor.position.y+=jumpHeight;
  if(ready){
    const target=actor.position.clone().add(new THREE.Vector3(0,indoors?3:5,0));
    camera.position.copy(target).add(new THREE.Vector3(Math.sin(yaw)*zoom*Math.cos(pitch),zoom*Math.sin(pitch),Math.cos(yaw)*zoom*Math.cos(pitch)));
    if(indoors){camera.position.x=THREE.MathUtils.clamp(camera.position.x,bounds.min.x+.6,bounds.max.x-.6);camera.position.z=THREE.MathUtils.clamp(camera.position.z,bounds.min.z+.6,bounds.max.z-.6);camera.position.y=Math.min(camera.position.y,bounds.max.y-.6);}
    camera.lookAt(target);
  }else{camera.position.set(0,25,40);camera.lookAt(0,0,0);}
  drawMap();renderer.render(scene,camera);actor.position.y-=jumpHeight;requestAnimationFrame(frame);
}
function drawMap(){
  $('cityMap').hidden=!ready||!playing||arcade.open;
  if($('cityMap').hidden||!$('cityMap').open)return;
  const c=$('mapCanvas').getContext('2d'),area=indoors?outside.bounds:bounds;
  const scale=270/Math.max(area.max.x-area.min.x,area.max.z-area.min.z);
  const ox=150-(area.min.x+area.max.x)*scale/2,oz=150-(area.min.z+area.max.z)*scale/2;
  const point=p=>({x:ox+p.x*scale,y:oz+p.z*scale});
  c.fillStyle='#122338';c.fillRect(0,0,300,300);
  c.strokeStyle='#53748a';c.strokeRect(ox+area.min.x*scale,oz+area.min.z*scale,(area.max.x-area.min.x)*scale,(area.max.z-area.min.z)*scale);
  for(const place of places){const b=place.box;c.fillStyle=place.shop?'#e8a1ed':'#8497aa';c.fillRect(ox+b.min.x*scale,oz+b.min.z*scale,Math.max(2,(b.max.x-b.min.x)*scale),Math.max(2,(b.max.z-b.min.z)*scale));}
  function mark(position,color,label){const p=point(position);c.fillStyle=color;c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fill();c.strokeStyle='#fff';c.lineWidth=1;c.stroke();if(label){c.font='bold 13px sans-serif';c.fillStyle='#fff';c.fillText(label,p.x+7,p.y-5);}}
  for(const bot of bots)mark(bot.mesh.position,'#b4c5ff','');
  for(const remote of onlinePlayers.values())if(remote.mesh.visible)mark(remote.target,'#ffe36b',remote.name);
  if(portal.visible)mark(portal.position,'#48ef95','');mark(redPortal.position,'#ff334d','');mark(mano.position,'#ffb347','M');
  const p=point(indoors?outside.position:actor.position);
  c.save();c.translate(p.x,p.y);c.rotate(Math.PI-actor.rotation.y);c.fillStyle=chosenColor;c.strokeStyle='white';c.lineWidth=2;c.beginPath();c.moveTo(0,-8);c.lineTo(6,6);c.lineTo(-6,6);c.closePath();c.fill();c.stroke();c.restore();
  c.fillStyle='#fff';c.font='12px sans-serif';c.fillText('N ↑',12,13);
  $('mapLocation').textContent=indoors?'No quarto · marcador na entrada':rooftop?'No telhado':climb?'Escalando':'Você está na cidade';
}
requestAnimationFrame(frame);

addEventListener('arthur-world-changed',event=>{
  resetControls();if(arcade.open)document.getElementById('arcade').close();
  if(ready){leaveRoom();climb=null;rooftop=null;const p=event.detail.player;if(p){actor.position.x=p.x;actor.position.z=p.z;actor.position.y=bounds.max.y+.08;}}
});
