const GAMES = {
  sprint: ['Circuito turbo', 'Corrida', 'Segure → para acelerar, ↑/↓ para mudar de faixa e Turbo para atravessar os obstáculos. Chegue primeiro aos 2.400 m.'],
  hurdles: ['Corrida dos obstáculos', 'Corrida', 'Uma pista com mais obstáculos! Mude de faixa e use o turbo no momento certo.'],
  skyway: ['Pontes do céu', 'Plataforma', 'Atravesse as pontes até a bandeira. Cada plataforma é um ponto de retorno se você cair.'],
  climbup: ['Escalada relâmpago', 'Plataforma', 'Suba e atravesse sete plataformas. Quem alcançar a bandeira primeiro vence.'],
  arena: ['Arena das estrelas', 'Batalha', 'Mova-se para desviar. Disparar mira no adversário mais próximo. Três acertos dão uma estrela; ganhe cinco para vencer.'],
  build: ['Nosso pequeno mundo', 'Construção', 'Construam juntos num terreno de 1.000 × 1.000: até 1.000.000 de blocos, sem limite por pessoa. Escolha uma cor ou uma construção pronta. Clique para construir e use WASD para explorar. Clique num carro para dirigir ou numa constru\u00e7\u00e3o para entrar; use Sair para voltar. Deslize pelo terreno para alcançar todos os quadrados. Use Salvar mundo para guardar tudo e Carregar mundo salvo numa partida vazia para continuar depois.'],
  blueprint: ['Construtor relâmpago', 'Construção', 'Preencha os 12 quadrados do projeto antes dos amigos! Cada pessoa tem seu próprio terreno e todos recebem o mesmo desenho.'],
};

export function createSocialArcade(legacy, resetWorld) {
  const portal = document.getElementById('arcade');
  const catalog = document.createElement('section');
  catalog.className = 'social-catalog';
  catalog.innerHTML = '<h3>Novos desafios com amigos</h3><div class="social-game-list">' +
    Object.entries(GAMES).map(([key,[title,category]]) => `<button data-social-game="${key}"><small>${category}</small>${title}</button>`).join('') + '</div>';
  portal.querySelector('.arcade-options').before(catalog);
  portal.querySelector('#arcade-info').textContent = 'Escolha entre 17 minigames!';
  const panel = document.createElement('dialog');
  panel.id = 'social-arcade';
  panel.innerHTML = `<header class="social-heading"><h2></h2><button id="social-exit">Voltar ao portal</button></header>
    <div id="social-save-tools" hidden><button id="social-save">Salvar mundo</button><button id="social-load">Carregar mundo salvo</button><small>Guardado neste servidor; reabra neste navegador. Carregar cria uma cópia editável numa partida vazia.</small></div><p id="social-help"></p><p id="social-status" role="status" aria-live="polite"></p>
    <div class="social-lobby"><label>Jogadores <select id="social-count">${Array.from({length:29},(_,i)=>`<option>${i+2}</option>`).join('')}</select></label>
    <button id="social-join">Entrar na partida</button><button id="social-solo">Treinar sozinho</button><button id="social-people">Pessoas</button></div>
    <button id="social-out" hidden>Sair</button><button id="social-recover" hidden>Recuperar carro</button><div class="social-board"><canvas width="720" height="400" aria-label="Partida com amigos"></canvas></div>
    <div id="social-prefabs" hidden><button data-prefab="block" aria-pressed="true">Blocos</button><button id="social-rectangle" aria-pressed="false">Construção de blocos</button><span id="social-rectangle-tools" hidden><label>Largura X <input id="social-width" type="number" min="1" max="1000" value="1" style="width:65px"></label><label>Altura Y <input id="social-height" type="number" min="1" max="1000" value="1" style="width:65px"></label><small>Clique no centro para colocar. Ou arraste em qualquer direção; o ponto inicial conta como 1 bloco. Desative para deslizar o terreno.</small></span><button data-prefab="car" aria-pressed="false">Carros</button><button data-prefab="house" aria-pressed="false">Casas</button><button data-prefab="shop" aria-pressed="false">Lojas</button><button data-prefab="market" aria-pressed="false">Supermercados</button><button data-prefab="building" aria-pressed="false">Prédios</button><button data-prefab="garage" aria-pressed="false">Garagens</button><span id="social-placement">Escolha e clique numa área livre.</span></div><div id="social-build-tools" hidden><label>Bloco <select id="social-color">${['Verde','Amarelo','Azul','Roxo','Vermelho','Laranja','Rosa','Ciano','Marrom','Branco','Cinza','Preto'].map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></label><button id="social-erase" aria-pressed="false">Remover: não</button><button id="social-fit" aria-pressed="false">Ver todo o terreno</button><span id="social-budget"></span></div>
    <div class="social-controls"><div class="social-pad"><button data-social-key="up" aria-label="Cima">↑</button><div><button data-social-key="left" aria-label="Esquerda">←</button><button data-social-key="down" aria-label="Baixo">↓</button><button data-social-key="right" aria-label="Direita">→</button></div></div><button data-social-key="action" id="social-action">Pular</button></div>
    <ol id="social-scores" aria-label="Classificação"></ol><button id="social-again" hidden>Nova partida</button>`;
  document.body.append(panel);
  const $ = id => panel.querySelector('#'+id);
  const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d');
  const board=canvas.parentElement,spacer=document.createElement('div');
  spacer.className='social-world-space';spacer.hidden=true;board.append(spacer);
  let overview=false;
  function terrainCamera(){return mode==='build'&&!overview?{x:Math.min(28000-canvas.width,board.scrollLeft),y:Math.min(28000-canvas.height,board.scrollTop)}:{x:0,y:0};}
  function view(){const c=terrainCamera();return {col:Math.floor(c.x/28),row:Math.floor(c.y/28),overview};}
  function terrainView(inside=false){
    spacer.hidden=mode!=='build'||inside||overview;
    board.classList.toggle('world-scroll',!spacer.hidden);
    board.classList.toggle('fit-terrain',overview&&!inside);
  }
  board.addEventListener('scroll',()=>{if(mode==='build'&&!overview){hover=null;if(!drag)draw();}});
  let mode=null,room=null,active=false,erase=false,inputBusy=false,joining=false,leaving=false,buildBusy=false,joinedAt=0,noticeUntil=0;
  let saving=false;
  let tool='block',hover=null,rectangle=false,drag=null,suppressClick=false;
  function rectangleMode(value){rectangle=value;drag=null;$('social-rectangle').setAttribute('aria-pressed',String(value));$('social-rectangle-tools').hidden=!value;canvas.style.touchAction=value?'none':'';}
  function dimensions(){return [Math.max(1,Math.min(1000,Number($('social-width').value)||1)),Math.max(1,Math.min(1000,Number($('social-height').value)||1))].map(Math.floor);}
  function selection(){if(drag&&drag.moved)return {col:Math.min(drag.start.col,drag.end.col),row:Math.min(drag.start.row,drag.end.row),w:Math.abs(drag.end.col-drag.start.col)+1,h:Math.abs(drag.end.row-drag.start.row)+1};if(!hover)return null;const [w,h]=dimensions();return {col:hover.col-Math.floor((w-1)/2),row:hover.row-Math.floor((h-1)/2),w,h};}
  const footprints={block:[1,1],car:[2,3],house:[3,3],shop:[4,3],market:[5,4],building:[3,5],garage:[4,3]};
  canvas.tabIndex=0;
  const held=new Set(),pointers=new Map();
  function clear(){held.clear();pointers.clear();}
  function status(text){if($('social-status').textContent!==text)$('social-status').textContent=text;}
  function controls(){
    overview=false;terrainView();rectangleMode(false);$('social-out').hidden=true;
    $('social-recover').hidden=true;
    $('social-save-tools').hidden=mode!=='build';$('social-save').disabled=true;$('social-load').disabled=true;
    const building=mode==='build'||mode==='blueprint';
    canvas.width=mode==='build'?1120:720;canvas.height=mode==='build'?700:400;
    panel.querySelector('.social-board').classList.toggle('large-terrain',mode==='build');
    panel.querySelector('.social-board').classList.remove('fit-terrain');
    $('social-fit').hidden=mode!=='build';$('social-fit').setAttribute('aria-pressed','false');$('social-fit').textContent='Ver todo o terreno';
    $('social-build-tools').hidden=!building;
    panel.querySelector('.social-controls').hidden=mode==='blueprint';
    $('social-prefabs').hidden=mode!=='build';$('social-action').hidden=mode==='build';
    const platform=mode==='skyway'||mode==='climbup';
    for(const b of panel.querySelectorAll('[data-social-key="up"],[data-social-key="down"]'))b.hidden=platform;
    $('social-action').textContent=mode==='arena'?'Disparar':platform?'Pular':'Turbo';
    $('social-solo').hidden=mode==='arena';
  }
  function adopt(data){
    if(!data||data.mode!==mode||!active)return;
    if(room&&data.id!==room.id)return;
    const previous=room?.players.find(p=>p.id===window.arthurOnline?.self);
    if(previous?.vehicle!=null&&data.vehicles?.[previous.vehicle]?.garage!=null){
      clear();noticeUntil=performance.now()+3500;status('Carro guardado na garagem! Use Recuperar carro perto dela para dirigir novamente.');
    }
    room=data;
    $('social-save').disabled=saving||data.phase!=='playing';$('social-load').disabled=saving||data.phase!=='playing'||data.block_count>0;
    $('social-recover').hidden=!data.recoverable?.length;
    const names=data.winners.map(id=>data.players.find(p=>p.id===id)?.name||'Jogador');
    const text=data.phase==='waiting'?`Esperando amigos: ${data.players.length}/${data.required}. Escolham este mesmo minigame.`:
      data.phase==='countdown'?`Todos prontos! Começa em ${Math.max(1,data.countdown)}…`:
      data.phase==='finished'?(names.length>1?'Empate: ':'Vencedor: ')+names.join(', '):
      mode==='build'?`${data.players.length} construtores · terreno compartilhado`:`Valendo! ${data.seconds} segundos restantes.`;
    if(performance.now()>noticeUntil)status(text);
    $('social-again').hidden=data.phase!=='finished';
    const self=data.players.find(p=>p.id===window.arthurOnline?.self);
    if(mode==='build'){
      const inside=self?.inside!=null,busy=inside||self?.vehicle!=null;terrainView(inside);
      const width=inside?720:Math.max(1,board.clientWidth),height=inside?400:Math.min(700,Math.floor(innerHeight*.45));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;canvas.parentElement.scrollTo(0,0);}
      canvas.parentElement.classList.toggle('large-terrain',!inside);
      $('social-prefabs').hidden=busy;$('social-build-tools').hidden=busy;
      $('social-out').hidden=!busy;$('social-out').textContent=inside?'Sair da constru\u00e7\u00e3o':'Sair do carro';
    }
    $('social-budget').textContent=mode==='build'?`${(data.block_count||0).toLocaleString("pt-BR")}/1.000.000 blocos no terreno · ${self?.score||0} colocados por você`:`${self?.score||0}/12 blocos do projeto`;
    const scores=data.players.slice().sort((a,b)=>b.score-a.score);
    $('social-scores').replaceChildren(...scores.map(p=>{const li=document.createElement('li');li.textContent=p.name+' — '+p.score+(mode==='arena'?' estrelas · '+p.hp+' vidas':'');return li;}));
    draw();
  }
  async function enter(required){
    if(joining||leaving)return;joining=true;clear();
    try{
      if(!window.arthurOnline?.connected)throw Error('Abra Pessoas e entre com seu nome para jogar.');
      const reply=await window.arthurArcadeRequest('arcade_join',{mode,required});
      active=true;joinedAt=performance.now();room=null;adopt(reply.arcade);
      window.arthurOnline.game={type:mode,selected:mode,required};
      panel.querySelector('.social-lobby').hidden=true;
    }catch(error){status(error.message);}
    finally{joining=false;}
  }
  async function leave(){
    if(leaving||joining)return;leaving=true;clear();
    try{
      if(active)await window.arthurArcadeRequest('arcade_leave');
      active=false;room=null;window.arthurOnline.game=null;window.arthurOnline.arcade=null;
      panel.close();resetWorld();legacy.show();
    }catch(error){status('Não foi possível sair da sala. Confira a conexão e tente novamente.');}
    finally{leaving=false;}
  }
  function open(type,required=2){
    if(!GAMES[type]||joining||leaving)return;
    if(active)return;
    if(portal.open)portal.close();
    resetWorld();clear();mode=type;room=null;erase=false;
    $('social-erase').textContent='Remover: não';$('social-erase').setAttribute('aria-pressed','false');
    panel.querySelector('h2').textContent=GAMES[type][0];$('social-help').textContent=GAMES[type][2];
    $('social-count').value=String(Math.max(2,Math.min(30,Number(required)||2)));
    panel.querySelector('.social-lobby').hidden=false;$('social-again').hidden=true;$('social-scores').replaceChildren();
    status('Escolha quantos amigos vão participar e entre na partida.');controls();
    if(!panel.open)panel.showModal();draw();
  }
  catalog.addEventListener('click',e=>{const b=e.target.closest('[data-social-game]');if(b)open(b.dataset.socialGame);});
  $('social-join').onclick=()=>enter(Number($('social-count').value));
  $('social-solo').onclick=()=>enter(1);
  $('social-again').onclick=()=>enter(room?.required||2);
  $('social-exit').onclick=leave;
  async function interact(data){
    clear();hover=null;
    try{const reply=await window.arthurArcadeRequest('arcade_interact',data);adopt(reply.arcade);canvas.focus({preventScroll:true});}
    catch(error){noticeUntil=performance.now()+3000;status(error.message);}
  }
  async function savedWorld(load){
    if(saving||!active||mode!=='build')return;
    saving=true;clear();$('social-save').disabled=$('social-load').disabled=true;
    noticeUntil=Infinity;status(load?'Carregando o mundo inteiro...':'Salvando o mundo inteiro...');
    try{
      let key=localStorage.getItem('arthur-build-save');
      if(load&&!key)throw Error('Ainda n\u00e3o h\u00e1 um mundo salvo neste navegador.');
      if(!key){key=Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');localStorage.setItem('arthur-build-save',key);}
      const reply=await window.arthurArcadeRequest(load?'arcade_load':'arcade_save',{save_key:key});
      adopt(reply.arcade);
      if(load){const self=reply.arcade.players.find(p=>p.id===window.arthurOnline.self);overview=false;terrainView();board.scrollTo(Math.max(0,self.x-canvas.width/2),Math.max(0,self.y-canvas.height/2));}
      status(load?'Mundo carregado! Pode continuar construindo.':'Mundo inteiro salvo! Blocos, constru\u00e7\u00f5es e carros guardados.');
    }catch(error){status(error.message);}
    finally{saving=false;noticeUntil=performance.now()+6000;$('social-save').disabled=room?.phase!=='playing';$('social-load').disabled=room?.phase!=='playing'||room?.block_count>0;}
  }
  $('social-save').onclick=()=>savedWorld(false);
  $('social-load').onclick=()=>savedWorld(true);
  $('social-out').onclick=()=>interact({exit:true});
  $('social-recover').onclick=()=>{if(room?.recoverable?.length)void interact({recover:room.recoverable[0]});};
  $('social-people').onclick=()=>document.getElementById('peopleButton').click();
  panel.addEventListener('cancel',e=>{e.preventDefault();void leave();});
  $('social-erase').onclick=()=>{rectangleMode(false);erase=!erase;$('social-erase').textContent='Remover: '+(erase?'sim':'não');$('social-erase').setAttribute('aria-pressed',String(erase));};
  $('social-fit').onclick=()=>{
    overview=!overview;const fit=overview;board.scrollTo(0,0);terrainView();draw();
    $('social-fit').setAttribute('aria-pressed',String(fit));$('social-fit').textContent=fit?'Ampliar para construir':'Ver todo o terreno';
  };
  $('social-prefabs').addEventListener('click',e=>{
    const button=e.target.closest('[data-prefab]');if(!button)return;
    rectangleMode(false);tool=button.dataset.prefab;erase=false;$('social-erase').setAttribute('aria-pressed','false');$('social-erase').textContent='Remover: não';
    for(const b of panel.querySelectorAll('[data-prefab]'))b.setAttribute('aria-pressed',String(b===button));
    const [w,h]=footprints[tool];$('social-placement').textContent=button.textContent+': '+w+' × '+h+' quadrados. Clique numa área livre.';draw();
  });
  $('social-rectangle').onclick=()=>{
    rectangleMode(!rectangle);erase=false;$('social-erase').textContent='Remover: n\u00e3o';$('social-erase').setAttribute('aria-pressed','false');draw();
  };
  for(const id of ['social-width','social-height'])$(id).oninput=()=>draw();
  function pointerCell(e){const r=canvas.getBoundingClientRect();return {col:Math.floor((e.clientX-r.left)*canvas.width/r.width/28+terrainCamera().x/28),row:Math.floor((e.clientY-r.top)*canvas.height/r.height/28+terrainCamera().y/28)};}
  canvas.addEventListener('pointerdown',e=>{
    const self=room?.players.find(p=>p.id===window.arthurOnline?.self);
    if(overview||!rectangle||mode!=='build'||!active||buildBusy||room?.phase!=='playing'||self?.inside!=null||self?.vehicle!=null||e.button!==0||drag)return;
    e.preventDefault();hover=pointerCell(e);drag={id:e.pointerId,start:hover,end:hover,moved:false};canvas.setPointerCapture(e.pointerId);draw();
  });
  canvas.addEventListener('pointerup',async e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const area=selection();drag=null;suppressClick=true;e.preventDefault();buildBusy=true;
    try{
      if(!area||area.col<0||area.row<0||area.col+area.w>1000||area.row+area.h>1000)throw Error('Escolha uma \u00e1rea dentro do terreno.');
      const reply=await window.arthurArcadeRequest('arcade_build',{kind:'rectangle',cell:area.row*1000+area.col,width:area.w,height:area.h,color:Number($('social-color').value)});adopt(reply.arcade);
    }catch(error){noticeUntil=performance.now()+3000;status(error.message);}
    finally{buildBusy=false;canvas.focus({preventScroll:true});draw();}
  });
  for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;draw();});
  canvas.addEventListener('pointermove',e=>{
    if(mode!=='build'||!room)return;const r=canvas.getBoundingClientRect();
    hover=pointerCell(e);if(drag&&drag.id===e.pointerId){drag.end=hover;drag.moved=hover.col!==drag.start.col||hover.row!==drag.start.row;}draw();
  });
  canvas.addEventListener('pointerleave',()=>{hover=null;if(room)draw();});
  function grid(){return mode==='build'?{cols:1000,rows:1000,size:28,x:0,y:0}:{cols:16,rows:9,size:36,x:72,y:48};}
  canvas.addEventListener('click',async e=>{
    if(mode==='build'&&overview){
      const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*28000,y=(e.clientY-r.top)/r.height*28000;
      overview=false;terrainView();$('social-fit').setAttribute('aria-pressed','false');$('social-fit').textContent='Ver todo o terreno';board.scrollTo(Math.max(0,x-board.clientWidth/2),Math.max(0,y-board.clientHeight/2));draw();return;
    }
    if(suppressClick){suppressClick=false;return;}if(rectangle)return;
    if(!active||buildBusy||!['build','blueprint'].includes(mode)||room?.phase!=='playing')return;
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width+terrainCamera().x,y=(e.clientY-r.top)*canvas.height/r.height+terrainCamera().y,g=grid();
    const self=room.players.find(p=>p.id===window.arthurOnline?.self);
    if(mode==='build'&&(self?.inside!=null||self?.vehicle!=null))return;
    let cell;
    if(mode==='build'){
      const car=Object.entries(room.vehicles||{}).find(([id,v])=>v.garage==null&&x>=v.x&&x<v.x+56&&y>=v.y&&y<v.y+84);
      if(car)cell=Number(car[0]);
    }
    const col=Math.floor((x-g.x)/g.size),row=Math.floor((y-g.y)/g.size);
    cell??=row*g.cols+col;
    if(mode==='build'&&!erase&&room.blocks[cell]?.kind){await interact({cell});return;}
    if(col<0||col>=g.cols||row<0||row>=g.rows)return;
    canvas.focus({preventScroll:true});buildBusy=true;
    try{const reply=await window.arthurArcadeRequest('arcade_build',{cell,kind:mode==='build'?tool:'block',erase,color:Number($('social-color').value)});adopt(reply.arcade);}
    catch(error){noticeUntil=performance.now()+3000;status(error.message);}
    finally{buildBusy=false;}
  });
  for(const button of panel.querySelectorAll('[data-social-key]')){
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);pointers.set(e.pointerId,button.dataset.socialKey);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>pointers.delete(e.pointerId));
  }
  const mapping={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',' ':'action'};
  addEventListener('keydown',e=>{if(!panel.open||document.querySelector('dialog[open]:not(#social-arcade)')||e.target.closest?.('input,select,textarea'))return;const key=mapping[e.key.length===1?e.key.toLowerCase():e.key];if(key){e.preventDefault();held.add(key);}});
  addEventListener('keyup',e=>held.delete(mapping[e.key.length===1?e.key.toLowerCase():e.key]));
  addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  addEventListener('arthur-online-players',()=>{
    if(!active)return;
    const data=window.arthurOnline?.arcade;
    if(data)adopt(data);
    else if(performance.now()-joinedAt>2000){active=false;room=null;clear();panel.querySelector('.social-lobby').hidden=false;status('A sala foi encerrada. Entre novamente para começar outra partida.');}
  });
  addEventListener('arthur-world-changed',()=>{active=false;room=null;clear();if(panel.open)panel.close();});
  addEventListener('arthur-online-status',()=>{if(active){clear();status('Conexão interrompida. Aguardando o servidor…');}});
  setInterval(async()=>{
    if(!active||!panel.open||inputBusy||joining||leaving||!window.arthurOnline?.connected)return;
    if(mode==='blueprint')return;
    inputBusy=true;
    const blocked=!!document.querySelector('dialog[open]:not(#social-arcade)');
    const input=Object.fromEntries(['left','right','up','down','action'].map(k=>[k,!blocked&&(held.has(k)||[...pointers.values()].includes(k))]));
    try{const reply=await window.arthurArcadeRequest('arcade_input',{input,view:view()});adopt(reply.arcade);}
    catch(error){status(error.message);}
    finally{inputBusy=false;}
  },100);
  function drawInterior(self){
    const kind=room.blocks[self.inside]?.kind;
    const names={house:'Casa',shop:'Loja',market:'Supermercado',building:'Pr\u00e9dio',garage:'Garagem'};
    ctx.fillStyle='#d5c5a5';ctx.fillRect(16,45,688,335);
    ctx.strokeStyle='#b6a789';
    for(let x=16;x<704;x+=40){ctx.beginPath();ctx.moveTo(x,45);ctx.lineTo(x,380);ctx.stroke();}
    const furniture=(x,y,w,h,color,label)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);ctx.fillStyle='#fff';ctx.font='14px sans-serif';ctx.fillText(label,x+8,y+23);};
    if(kind==='market'||kind==='shop'){
      for(let i=0;i<3;i++){
        furniture(80+i*210,85,125,135,'#75604d',kind==='market'?['Frutas','Bebidas','Alimentos'][i]:['Roupas','Brinquedos','Presentes'][i]);
        for(let j=0;j<4;j++)for(let k=0;k<3;k++){ctx.fillStyle=['#ed7878','#83ca76','#f7ce67'][k];ctx.fillRect(88+i*210+j*28,125+k*28,18,18);}
      }
      furniture(70,285,150,50,'#537f91','Caixa');
    }else if(kind==='garage'){
      for(let i=0;i<3;i++){ctx.strokeStyle='#fff';ctx.strokeRect(85+i*205,85,150,150);}
      furniture(65,285,180,50,'#536478','Ferramentas');
    }else if(kind==='building'){
      furniture(70,85,180,65,'#537f91','Recep\u00e7\u00e3o');
      furniture(470,80,170,100,'#657082','Elevadores');
      furniture(85,245,150,55,'#7b689b','Sof\u00e1');
    }else{
      furniture(80,80,160,75,'#7b689b','Sof\u00e1');
      furniture(485,80,140,120,'#6394b1','Cama');
      furniture(280,200,130,65,'#9a714c','Mesa');
    }
    ctx.fillStyle='#ffdc72';ctx.fillRect(310,375,100,20);
    ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.fillText(names[kind]+' - WASD ou setas para andar',25,30);
    for(const p of room.players.filter(p=>p.inside===self.inside)){
      ctx.fillStyle=p.color;ctx.fillRect(p.x+3,p.y+10,20,22);ctx.fillStyle='#ffe1b2';ctx.fillRect(p.x+6,p.y,14,13);
      ctx.fillStyle='#172a3b';ctx.font='13px sans-serif';ctx.fillText(p.name,p.x,p.y-5);
    }
  }
  function draw(){
    ctx.fillStyle=mode==='arena'?'#1e3056':'#10243a';ctx.fillRect(0,0,canvas.width,canvas.height);
    if(!room){ctx.fillStyle='#e8f4ff';ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText('Seu próximo desafio começa aqui',360,190);ctx.textAlign='left';return;}
    const self=room.players.find(p=>p.id===window.arthurOnline?.self);
    if(mode==='build'&&self?.inside!=null){drawInterior(self);return;}
    if(mode==='build'||mode==='blueprint'){
      const g=grid(),cam=terrainCamera();
      if(mode==='build'&&overview){
        ctx.fillStyle='#203c50';ctx.fillRect(0,0,canvas.width,canvas.height);
        for(const [key,count] of Object.entries(room.overview||{})){ctx.fillStyle=`rgba(99,239,154,${.3+.7*count/100})`;ctx.fillRect(Number(key)%100*canvas.width/100,Math.floor(Number(key)/100)*canvas.height/100,canvas.width/100,canvas.height/100);}
        for(const p of room.players){ctx.fillStyle=p.color;ctx.fillRect(p.x/28000*canvas.width,p.y/28000*canvas.height,5,5);}
        ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('1.000 x 1.000 - clique para ampliar uma parte do terreno',12,24);return;
      }
      ctx.save();ctx.translate(-cam.x,-cam.y);
      const firstCol=mode==='build'?Math.floor(cam.x/28):0,firstRow=mode==='build'?Math.floor(cam.y/28):0;
      const lastCol=mode==='build'?Math.min(1000,firstCol+41):g.cols,lastRow=mode==='build'?Math.min(1000,firstRow+26):g.rows;
      for(let row=firstRow;row<lastRow;row++)for(let col=firstCol;col<lastCol;col++){
        const cell=row*g.cols+col;
        const x=g.x+(cell%g.cols)*g.size,y=g.y+Math.floor(cell/g.cols)*g.size;
        ctx.fillStyle=room.template.includes(cell)?'#6b7990':'#203c50';ctx.fillRect(x+1,y+1,g.size-2,g.size-2);
        if(room.blocks[cell]&&room.blocks[cell].kind!=='car'){ctx.fillStyle=room.blocks[cell].color;ctx.fillRect(x+3,y+3,g.size-6,g.size-6);ctx.fillStyle='#ffffff55';ctx.fillRect(x+5,y+5,g.size-10,5);}
      }
      if(mode==='build'){
        for(const [cell,b] of Object.entries(room.blocks)){
          if(b.anchor!==Number(cell)||!footprints[b.kind])continue;
          const [w,h]=footprints[b.kind],car=room.vehicles?.[cell],x=car?car.x:(b.anchor%1000)*28,y=car?car.y:Math.floor(b.anchor/1000)*28;
          if(car?.garage!=null)continue;
          ctx.fillStyle=b.color;ctx.fillRect(x+3,y+3,w*28-6,h*28-6);
          if(b.kind==='car'){
            ctx.fillStyle='#152535';for(const yy of [16,55]){ctx.fillRect(x+4,y+yy,8,15);ctx.fillRect(x+44,y+yy,8,15);}
            ctx.fillStyle=b.color;ctx.fillRect(x+11,y+5,34,74);
            ctx.fillStyle='#a6e8ff';ctx.fillRect(x+15,y+18,26,15);ctx.fillRect(x+15,y+53,26,12);
            if(car?.driver){ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.fillText(room.players.find(p=>p.id===car.driver)?.name||'',x,y-4);}
            ctx.fillStyle='#fff7b2';ctx.fillRect(x+13,y+7,8,5);ctx.fillRect(x+35,y+7,8,5);
          }else{
            const labels={shop:'LOJA',house:'CASA',market:'MERCADO',building:'PRÉDIO',garage:'GARAGEM'};
            ctx.fillStyle=b.kind==='house'?'#dc6d61':'#ffdd72';ctx.fillRect(x+3,y+3,w*28-6,22);
            ctx.fillStyle='#173553';ctx.font='bold 13px sans-serif';ctx.fillText(labels[b.kind],x+8,y+19);
            if(b.kind==='garage'){
              ctx.fillStyle='#566477';ctx.fillRect(x+10,y+30,w*28-20,h*28-36);
              ctx.strokeStyle='#c2d2df';for(let yy=36;yy<h*28-6;yy+=9){ctx.beginPath();ctx.moveTo(x+10,y+yy);ctx.lineTo(x+w*28-10,y+yy);ctx.stroke();}
            }else{
              ctx.fillStyle='#9de4ed';
              for(let yy=34;yy<h*28-24;yy+=27)for(let xx=10;xx<w*28-26;xx+=30)ctx.fillRect(x+xx,y+yy,20,18);
              ctx.fillStyle='#263846';ctx.fillRect(x+w*28-30,y+h*28-36,20,30);
              if(b.kind==='market'){ctx.fillStyle='#ef677b';for(let xx=5;xx<w*28-6;xx+=18)ctx.fillRect(x+xx,y+25,10,9);}
            }
          }
        }
        for(const p of room.players.filter(p=>p.inside==null&&p.vehicle==null)){ctx.fillStyle=p.color;ctx.fillRect(p.x+3,p.y+10,20,22);ctx.fillStyle='#ffe1b2';ctx.fillRect(p.x+6,p.y,14,13);ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.fillText(p.name,p.x,p.y-4);}
        if(rectangle&&hover&&self?.vehicle==null){
          const a=selection();const valid=a.col>=0&&a.row>=0&&a.col+a.w<=1000&&a.row+a.h<=1000&&!Object.keys(room.blocks).some(c=>Number(c)%1000>=a.col&&Number(c)%1000<a.col+a.w&&Math.floor(Number(c)/1000)>=a.row&&Math.floor(Number(c)/1000)<a.row+a.h);
          ctx.fillStyle=valid?'#63ef9a66':'#ff606077';ctx.fillRect(a.col*28,a.row*28,a.w*28,a.h*28);
          ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((drag?.start.col??hover.col)*28+14,(drag?.start.row??hover.row)*28+14,4,0,Math.PI*2);ctx.fill();
          ctx.font='bold 16px sans-serif';ctx.fillText(a.w+' x '+a.h+' = '+a.w*a.h+' blocos',a.col*28+4,a.row*28+20);
        }
        if(!rectangle&&hover&&!erase&&self?.vehicle==null){
          const [w,h]=footprints[tool];const valid=hover.col>=0&&hover.row>=0&&hover.col+w<=1000&&hover.row+h<=1000&&Array.from({length:w*h},(_,i)=>(hover.row+Math.floor(i/w))*1000+hover.col+i%w).every(c=>!room.blocks[c]);
          ctx.fillStyle=valid?'#63ef9a55':'#ff606077';ctx.fillRect(hover.col*28,hover.row*28,w*28,h*28);ctx.strokeStyle=valid?'#a0ffc4':'#ff8888';ctx.lineWidth=2;ctx.strokeRect(hover.col*28+1,hover.row*28+1,w*28-2,h*28-2);
        }
        if(self&&(held.size||pointers.size)){
          const board=canvas.parentElement,scale=canvas.getBoundingClientRect().width/canvas.width;
          board.scrollLeft=Math.max(0,self.x-canvas.width/2);board.scrollTop=Math.max(0,self.y-canvas.height/2);
        }
      }
      ctx.restore();
      if(mode!=='build'){ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('Preencha o projeto destacado',72,30);}
      return;
    }
    const race=['sprint','hurdles'].includes(mode),platform=['skyway','climbup'].includes(mode);
    const camera=race?Math.max(0,Math.min(1700,(self?.x||0)-200)):platform?Math.max(0,Math.min(880,(self?.x||0)-200)):0;
    ctx.save();ctx.translate(-camera,0);
    if(race){
      ctx.fillStyle='#344a62';ctx.fillRect(0,80,2440,280);
      ctx.strokeStyle='#b8d0df';ctx.setLineDash([24,20]);
      for(const y of [155,230,305]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(2440,y);ctx.stroke();}ctx.setLineDash([]);
      for(const [x,y] of room.obstacles){ctx.fillStyle='#f29e52';ctx.fillRect(x-20,y-20,40,40);}
      ctx.fillStyle='#fff';ctx.fillRect(2400,80,8,280);
    }
    if(platform){
      ctx.fillStyle='#213e66';ctx.fillRect(0,0,1600,400);
      for(const [x,y,w] of room.platforms){ctx.fillStyle='#62c995';ctx.fillRect(x,y,w,12);ctx.fillStyle='#785c59';ctx.fillRect(x,y+12,w,25);}
      ctx.fillStyle='#fff';ctx.fillRect(1560,100,5,180);ctx.fillStyle='#ffdc63';ctx.fillRect(1565,100,30,22);
    }
    for(const p of room.players){
      ctx.globalAlpha=p.immune>0?.6:1;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,26,32);ctx.fillStyle='#fff';ctx.fillRect(p.x+5,p.y+7,5,6);ctx.fillRect(p.x+16,p.y+7,5,6);
      ctx.globalAlpha=1;ctx.fillStyle=p.id===window.arthurOnline?.self?'#ffdf6d':'#fff';ctx.font='13px sans-serif';ctx.fillText(p.name,p.x-4,p.y-8);
    }
    for(const b of room.bullets){ctx.fillStyle='#ffe579';ctx.beginPath();ctx.arc(b.x,b.y,6,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.fillText(race?`${Math.floor(self?.x||0)} / 2400 m · Turbo: ${self?.cooldown>0?'recarregando':'pronto'}`:platform?'Pontos de retorno nas plataformas':'Desvie e dispute 5 estrelas!',16,26);
  }
  return {get open(){return panel.open;},has:type=>!!GAMES[type],join:open};
}
