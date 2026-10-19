const $=id=>document.getElementById(id),panel=$('onlinePanel');let account=null,timer=null,requesting=false,lastUi=0,messagesReady=false;const knownMessages=new Set();window.arthurOnline={position:{x:0,z:0,color:'#1579ff'},players:[],self:null,game:null,connected:false};
try{account=JSON.parse(localStorage.getItem('arthur-online-account'));}catch{}
if(account?.id?.startsWith('local-')){account=null;localStorage.removeItem('arthur-online-account');}
function placeholder(name){let hue=0;for(const letter of name)hue=(hue*31+letter.charCodeAt(0))%360;const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="hsl(${hue} 70% 48%)"/><text x="40" y="53" text-anchor="middle" font-family="sans-serif" font-size="38" fill="white">${(name[0]||'?').toUpperCase()}</text></svg>`;return'data:image/svg+xml,'+encodeURIComponent(svg);}
async function call(action,extra={}){const response=await fetch('/__arthur_online__',{method:'POST',signal:globalThis.AbortSignal?.timeout?.(8000),headers:{'Content-Type':'application/json'},body:JSON.stringify({...extra,action,id:account?.id,token:account?.token})});let data;try{data=await response.json();}catch{throw Error('O modo online está desligado. Você ainda pode jogar normalmente.');}if(!response.ok){const error=Error(data.error||'O modo online está desligado.');error.status=response.status;throw error;}return data;}
window.arthurArcadeRequest=(action,data={})=>call(action,data);
const safe=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function alerts(data){const invite=data.players.find(player=>player.id!==account.id&&player.game?.type==='waiting'&&player.game.selected);if(invite&&!window.arthurOnline.game){$('gameInvite').hidden=false;$('gameInvite').innerHTML=`<strong>${safe(invite.name)} chamou para um minigame!</strong><br>${safe(invite.game.selected)} · ${invite.game.required} jogadores<button data-join="${safe(invite.game.selected)}" data-required="${invite.game.required}">Participar</button>`;}else if(!invite)$('gameInvite').hidden=true;const incoming=(data.messages||[]).filter(message=>message.to===account.id&&!knownMessages.has(message.id));for(const message of data.messages||[])knownMessages.add(message.id);if(messagesReady&&incoming.length){const latest=incoming.at(-1);$('messageNotice').textContent=`Opa! ${latest.name} mandou uma mensagem.`;$('messageNotice').hidden=false;setTimeout(()=>$('messageNotice').hidden=true,4500);if(window.speechSynthesis&&window.SpeechSynthesisUtterance){const speech=new SpeechSynthesisUtterance(`${latest.name} mandou uma mensagem`);speech.lang='pt-BR';speechSynthesis.speak(speech);}}messagesReady=true;}
function render(data){updateVoiceConversation(data.messages||[]);$('accountForm').hidden=true;$('onlineLobby').hidden=false;$('myProfile').innerHTML=`<img class="profile-photo" src="${account.avatar||placeholder(account.name)}" alt=""> <strong>${safe(account.name)}</strong> <span class="test-badge">SUA CONTA</span>`;$('roomStatus').textContent=data.ready?`Mundo privado com ${data.players.length} jogador${data.players.length===1?'':'es'}. Somente por convite. Limite: ${data.maximum}.`:'Aguarde enquanto alguém entra no servidor…';const others=data.players.filter(p=>p.id!==account.id);$('onlinePlayers').innerHTML=others.map(p=>`<article class="online-card"><img src="${p.avatar||placeholder(p.name)}" alt=""><p><strong>${safe(p.name)}</strong></p><button data-find="${p.id}">Encontrar</button><button data-friend="${p.id}">${data.friends.includes(p.id)?'Amigo':'Adicionar amigo'}</button></article>`).join('')||'<p>Seu mundo está só com você. Pesquise um amigo e convide para jogar.</p>';const selected=$('chatPlayer').value;$('chatPlayer').innerHTML='<option value="">Escolha uma pessoa</option>'+others.map(p=>`<option value="${p.id}">${safe(p.name)}</option>`).join('')||'<option value="">Ninguém online</option>';if(others.some(p=>p.id===selected))$('chatPlayer').value=selected;$('sendMessage').disabled=!others.length;$('talkMessage').disabled=!others.length;$('chatMessages').innerHTML=(data.messages||[]).map(message=>`<p role="button" tabindex="0" title="Ouvir mensagem; clique novamente para parar" data-read-message="${safe(message.id)}" class="chat-line ${message.from===account.id?'mine':''}"><strong>${message.from===account.id?'Você':safe(message.name)}:</strong> ${safe(message.text)}</p>`).join('');for(const message of data.messages||[]){knownMessages.add(message.id);}}
async function refresh(){if(!account||requesting)return;requesting=true;try{let data;const update=()=>call('update',{...window.arthurOnline.position,game:window.arthurOnline.game});try{data=await update();}catch(error){if(error.status!==401)throw error;const created=await call('create',{name:account.name,avatar:account.avatar});account={...account,...created};window.arthurOnline.worldVersion=-1;localStorage.setItem('arthur-online-account',JSON.stringify(account));data=await update();}if(!data.world)throw Error('Reinicie o servidor para ativar os mundos privados.');if(data.world_version<(window.arthurOnline.worldVersion||0))return;if(data.players.some(player=>!Object.hasOwn(player,'game')))throw Error('Servidor antigo: reinicie o server.py para habilitar as filas dos minigames.');window.arthurOnline.error='';window.arthurOnline.connected=true;window.arthurOnline.arcade=data.arcade||null;window.arthurOnline.players=data.players;applyWorld(data);updateVoiceConversation(data.messages||[]);if(!$('voiceHud').hidden)voiceChoices();window.arthurOnline.self=account.id;alerts(data);if(panel.open&&Date.now()-lastUi>500){render(data);lastUi=Date.now();}window.dispatchEvent(new CustomEvent('arthur-online-players',{detail:{self:account.id,players:data.players}}));}catch(error){window.arthurOnline.connected=false;window.arthurOnline.error=error.message;window.dispatchEvent(new CustomEvent('arthur-online-status'));if(panel.open)$('roomStatus').textContent=error.message;}finally{requesting=false;}}
$('onlineButton').onclick=()=>{panel.showModal();if(account)refresh();};
$('peopleButton').onclick=()=>{panel.showModal();if(account)refresh();};
$('quickChat').onclick=()=>{if(panel.open)panel.close();startVoice();};
$('gameInvite').addEventListener('click',event=>{const type=event.target.dataset.join;if(!type)return;$('gameInvite').hidden=true;window.arthurJoinMinigame?.(type,Number(event.target.dataset.required)||2);});
$('onlineClose').onclick=()=>panel.close();
$('accountForm').addEventListener('submit',async event=>{event.preventDefault();const name=$('onlineName').value.trim();if(!name)return;try{const created=await call('create',{name});account={...created,name,avatar:''};localStorage.setItem('arthur-online-account',JSON.stringify(account));await refresh();if(!timer)timer=setInterval(refresh,100);panel.close();$('start').click();}catch{$('accountForm').querySelector('p').textContent='O servidor online ainda não está conectado. Você pode jogar sozinho pelo botão Iniciar.';}});
$('onlinePlayers').addEventListener('click',async event=>{const target=event.target.dataset.friend;if(!target)return;try{render(await call('friend',{target}));}catch(error){alert(error.message);}});
$('sendMessage').addEventListener('click',async()=>{const target=$('chatPlayer').value,text=$('chatText').value.trim();if(!target||!text)return;try{render(await call('message',{target,text}));$('chatText').value='';}catch{$('roomStatus').textContent='Não foi possível enviar. Confira se o servidor está ligado.';}});
let activeVoice=null;
const normalizeVoiceName=name=>String(name).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function parseVoiceMessage(transcript,players){
  const spoken=transcript.trim();const separator=/:|\bdois\s+pontos\b/i.exec(spoken);
  if(!separator)return {text:spoken,target:null,error:'Diga o nome e “dois pontos” antes da mensagem. Exemplo: Arthur, dois pontos, vamos jogar.'};
  const name=spoken.slice(0,separator.index).trim();const text=spoken.slice(separator.index+separator[0].length).replace(/^[\s,;:.-]+/,'').trim();
  const normalized=normalizeVoiceName(name),matches=players.filter(p=>normalizeVoiceName(p.name)===normalized);
  if(!normalized||!matches.length)return {text,target:null,error:'Não encontrei “'+name+'” entre as pessoas online. Escolha o destinatário na lista.'};
  if(matches.length>1)return {text,target:null,error:'Há mais de uma pessoa chamada '+name+'. Escolha o destinatário na lista.'};
  return {text,target:matches[0],error:''};
}
let voiceMessages=[];
const voiceDraft={target:null,text:''};let voiceQueue=Promise.resolve(),voiceSending=false;
function voiceStatus(text){$('voiceStatus').textContent=text;$('voiceHudStatus').textContent=text;$('voiceHudStatus').hidden=!/não|nomes repetidos|passou de|interrompida|escolha uma pessoa/i.test(text);}
function voiceMicState(on){$('voiceMic').textContent=on?'🎤 Ativado · Desativar':'🎤 Ativar microfone';$('voiceMic').setAttribute('aria-pressed',String(on));}
function updateVoiceConversation(messages){
  if(Array.isArray(messages))voiceMessages=messages;
  const target=voiceDraft.target?.id;
  const visible=voiceMessages.filter(m=>target&&((m.from===account?.id&&m.to===target)||(m.from===target&&m.to===account?.id)));
  const box=$('voiceConversation');
  const content=visible.map(m=>'<p role="button" tabindex="0" title="Ouvir mensagem; clique novamente para parar" data-read-message="'+safe(m.id)+'" class="voice-line '+(m.from===account?.id?'mine':'')+'"><strong>'+safe(m.from===account?.id?'Você':m.name)+':</strong> '+safe(m.text)+'</p>').join('')||'<p class="voice-empty">'+(target?'Nenhuma mensagem ainda.':'Escolha uma pessoa para ver a conversa.')+'</p>';
  if(box.innerHTML!==content){const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<24;box.innerHTML=content;if(atBottom)box.scrollTop=box.scrollHeight;}
}
function voiceView(){

  $('voiceDraft').textContent=voiceDraft.text||'Fale sua mensagem…';$('voiceDraft').title=voiceDraft.text.length+'/1000 caracteres. Diga “enviar” para mandar.';
  $('chatPlayer').value=voiceDraft.target?.id||'';$('chatText').value=voiceDraft.text;$('voicePerson').value=voiceDraft.target?.id||'';updateVoiceConversation();
}
function voicePlayers(){return window.arthurOnline.players.filter(p=>p.id!==account?.id);}
function chooseVoiceTarget(name){
  const requested=normalizeVoiceName(name);const matches=voicePlayers().filter(p=>{const n=normalizeVoiceName(p.name);return n===requested||n+n===requested;});
  voiceDraft.target=matches.length===1?matches[0]:null;
  if(!voiceDraft.target)voiceStatus(matches.length?'Há nomes repetidos. Escolha a pessoa na lista.':'Não encontrei '+name+' online. Diga o nome novamente ou escolha na lista.');
  return !!voiceDraft.target;
}
function voiceChoices(){const selected=$('voicePerson').value;$('voicePerson').innerHTML='<option value="">Escolher pessoa</option>'+voicePlayers().map(p=>'<option value="'+safe(p.id)+'">'+safe(p.name)+'</option>').join('');$('voicePerson').value=voicePlayers().some(p=>p.id===selected)?selected:'';}
async function sendVoice(){
  if(voiceSending)return;
  if(!voiceDraft.target||!voiceDraft.text.trim()){voiceStatus('Escolha uma pessoa e fale uma mensagem antes de enviar.');return;}
  if(voiceDraft.text.length>1000){voiceStatus('A mensagem passou de 1.000 caracteres. Diga “limpar mensagem” e fale uma frase menor.');return;}
  if(!voicePlayers().some(p=>p.id===voiceDraft.target.id)){voiceStatus('Essa pessoa saiu do mundo. Escolha outra pessoa.');return;}
  voiceSending=true;const target=voiceDraft.target,text=voiceDraft.text;
  voiceStatus('Enviando para '+target.name+'…');
  try{const response=await call('message',{target:target.id,text});updateVoiceConversation(response.messages);if(voiceDraft.text===text)voiceDraft.text='';voiceStatus('Enviado para '+target.name+'.');voiceView();}
  catch{voiceStatus('Não foi possível confirmar o envio. Seu texto foi mantido. Confira antes de tentar novamente.');}
  finally{voiceSending=false;}
}
async function processVoice(transcript){
  let spoken=transcript.trim().replace(/\bdois\s+pontos\b/gi,':');
  const command=normalizeVoiceName(spoken);
  if(command==='limparmensagem'||command==='excluirmensagem'){voiceDraft.text='';voiceView();voiceStatus('Mensagem apagada.');return;}
  if(command==='removerdestinatario'||command==='excluirpessoa'){voiceDraft.target=null;voiceView();voiceStatus('Destinatário removido deste rascunho.');return;}
  if(command==='parardeouvir'){stopVoice();return;}
  // An explicit send command can come before or after the message.
  const send=/\b(?:enviar|mandar)\s+para\s+([^:]+)(?::\s*(.*))?$/i.exec(spoken);
  if(send){
    const before=spoken.slice(0,send.index).replace(/[\s,.;:]+$/,'');
    if(before)await processVoice(before);
    if(!chooseVoiceTarget(send[1].replace(/[.,;!?]+$/,''))){voiceView();return;}
    if(send[2]?.trim())voiceDraft.text=[voiceDraft.text,send[2].trim()].filter(Boolean).join(' ');
    voiceView();await sendVoice();return;
  }
  if(command==='enviar'||command==='mandar'){await sendVoice();return;}
  // Repeated name prefixes confirm the same person instead of entering the message.
  while(spoken.includes(':')){
    const separator=spoken.indexOf(':'),name=spoken.slice(0,separator).trim();
    if(!chooseVoiceTarget(name)){voiceView();return;}
    spoken=spoken.slice(separator+1).replace(/^[\s,;:]+/,'');
  }
  if(spoken&&voicePlayers().some(p=>[normalizeVoiceName(p.name),normalizeVoiceName(p.name).repeat(2)].includes(normalizeVoiceName(spoken)))){chooseVoiceTarget(spoken);spoken='';}
  if(spoken)voiceDraft.text=[voiceDraft.text,spoken].filter(Boolean).join(' ');
  voiceView();voiceStatus(voiceDraft.target?'Destinatário confirmado: '+voiceDraft.target.name+'. Diga “enviar para '+voiceDraft.target.name+'” quando terminar.':'Fale sua mensagem e depois diga “enviar para” e o nome da pessoa.');
}
function startVoice(){
  $('voiceHud').hidden=false;voiceChoices();voiceView();
  if(activeVoice){stopVoice();return;}
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!account){voiceStatus('Entre com seu nome em Pessoas para conversar online.');return;}
  if(!Recognition){voiceStatus('Este navegador não oferece ditado. Use a conversa escrita em Pessoas.');return;}
  const recognition=new Recognition();activeVoice=recognition;recognition.lang='pt-BR';recognition.interimResults=false;recognition.continuous=true;
  voiceMicState(true);$('talkMessage').textContent='■ Parar de ouvir';$('quickChat').textContent='■ Parar voz';voiceStatus('Ativando microfone… Permita o acesso se o navegador pedir.');
  recognition.onstart=()=>{if(activeVoice===recognition)voiceStatus('Ouvindo. Diga “Arthur: sua mensagem” e depois “enviar para Arthur”.');};
  recognition.onresult=event=>{
    if(activeVoice!==recognition)return;
    for(let i=event.resultIndex||0;i<event.results.length;i++){
      if(event.results[i].isFinal===false)continue;
      const transcript=event.results[i][0].transcript;
      voiceQueue=voiceQueue.then(()=>activeVoice===recognition?processVoice(transcript):undefined).catch(()=>voiceStatus('Não consegui entender. Tente falar novamente.'));
    }
  };
  recognition.onerror=event=>{if(activeVoice===recognition)voiceStatus(event.error==='not-allowed'?'Microfone não autorizado. Permita o acesso no navegador.':'A escuta foi interrompida. O rascunho foi mantido; clique em Falar para continuar.');};
  recognition.onend=()=>{if(activeVoice!==recognition)return;activeVoice=null;voiceMicState(false);$('talkMessage').textContent='🎤 Falar';$('quickChat').textContent='🎤 Falar';};
  try{recognition.start();}catch{activeVoice=null;voiceMicState(false);voiceStatus('Não foi possível ativar o microfone. Clique em Falar para tentar novamente.');$('quickChat').textContent='🎤 Falar';$('talkMessage').textContent='🎤 Falar';}
}
$('talkMessage').addEventListener('click',()=>{panel.close();startVoice();});
function stopVoice(){const recognition=activeVoice;activeVoice=null;recognition?.abort();voiceMicState(false);$('talkMessage').textContent='🎤 Falar';$('quickChat').textContent='🎤 Falar';voiceStatus('Microfone desligado. Rascunho mantido.');}
$('voiceMic').addEventListener('click',startVoice);
$('voicePerson').addEventListener('change',()=>{voiceDraft.target=voicePlayers().find(p=>p.id===$('voicePerson').value)||null;voiceView();});
window.addEventListener('pagehide',stopVoice);

if(account&&!account.id.startsWith('local-')){refresh();timer=setInterval(refresh,100);}

// Refresh immediately when returning to a window, while keeping background heartbeats active.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});

// Keep the same conversation inside the modal's top layer while playing minigames.
window.arthurVoice={
  mount(host){host.append($('voiceHud'));},
  restore(){document.body.append($('voiceHud'));},
  toggle(){startVoice();}
};

let chatSpeech=null,chatSpeechId=null;
function stopMessageReading(){if(chatSpeech&&window.speechSynthesis)window.speechSynthesis.cancel();chatSpeech=null;chatSpeechId=null;}
function readMessage(id){
  const message=voiceMessages.find(item=>item.id===id);if(!message)return;
  if(chatSpeechId===id){stopMessageReading();return;}
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){voiceStatus('Este navegador não oferece leitura em voz alta.');return;}
  if(activeVoice)stopVoice();
  stopMessageReading();window.speechSynthesis.cancel();
  const utterance=new window.SpeechSynthesisUtterance(message.text);utterance.lang='pt-BR';
  utterance.voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='pt-br')||null;
  chatSpeech=utterance;chatSpeechId=id;
  utterance.onend=()=>{if(chatSpeech===utterance){chatSpeech=null;chatSpeechId=null;}};
  utterance.onerror=()=>{if(chatSpeech===utterance){chatSpeech=null;chatSpeechId=null;voiceStatus('Não foi possível ler a mensagem. Tente novamente.');}};
  window.speechSynthesis.speak(utterance);
}
for(const id of ['chatMessages','voiceConversation']){
  const box=$(id);
  box.addEventListener('click',event=>{const item=event.target.closest('[data-read-message]');if(item)readMessage(item.dataset.readMessage);});
  box.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const item=event.target.closest('[data-read-message]');if(item){event.preventDefault();event.stopPropagation();readMessage(item.dataset.readMessage);}});
}
window.addEventListener('pagehide',stopMessageReading);

$('onlinePlayers').addEventListener('click',event=>{
  const id=event.target.dataset.find;if(!id)return;
  panel.close();window.dispatchEvent(new CustomEvent('arthur-find-player',{detail:{id}}));
});

// Searching reveals names only. Joining a world always requires accepting an invitation.
const privacyPanel=document.createElement('section');privacyPanel.id='world-privacy';
privacyPanel.innerHTML=`<h3>Convide seus amigos</h3><p>Você começa sozinho. Pesquisar não coloca ninguém no seu mundo.</p><form id="world-search-form"><label>Nome completo no jogo <input id="world-search-name" maxlength="20" placeholder="Gigi" required></label><button>Pesquisar</button></form><p id="world-search-status" role="status"></p><div id="world-search-results"></div><section id="world-invites" aria-label="Convites recebidos"></section><button id="world-leave">Voltar para um mundo só meu</button>`;
$('onlinePlayers').before(privacyPanel);
const invitationNotice=document.createElement('button');invitationNotice.id='world-invite-notice';invitationNotice.hidden=true;document.body.append(invitationNotice);
invitationNotice.onclick=()=>{if(!panel.open)panel.showModal();};
function applyWorld(data){
  if(!data.world)return;
  const previous=window.arthurOnline.world;
  window.arthurOnline.world=data.world;window.arthurOnline.worldVersion=data.world_version;
  if(previous&&previous!==data.world){
    window.arthurOnline.game=null;window.arthurOnline.arcade=null;
    knownMessages.clear();messagesReady=false;
    window.dispatchEvent(new CustomEvent('arthur-world-changed',{detail:{player:data.players.find(p=>p.id===account.id)}}));
  }
  const invites=data.invites||[];
  invitationNotice.hidden=!invites.length;
  invitationNotice.textContent=invites.length+' convite(s) para jogar';
  const html=invites.map(i=>`<article><p><strong>${safe(i.name)}</strong> convidou você para um mundo privado.</p><button data-world-accept="${safe(i.id)}">Aceitar e entrar</button><button data-world-decline="${safe(i.id)}">Recusar</button></article>`).join('');
  if($('world-invites').innerHTML!==html)$('world-invites').innerHTML=html;
}
$('world-search-form').addEventListener('submit',async event=>{
  event.preventDefault();$('world-search-status').textContent='Procurando…';
  try{
    const data=await call('world_search',{name:$('world-search-name').value.trim()});
    $('world-search-results').replaceChildren(...data.results.map(person=>{
      const card=document.createElement('article'),name=document.createElement('p'),button=document.createElement('button');
      name.textContent=person.name+' · #'+person.id.slice(-4);button.textContent='Convidar para meu mundo';
      button.onclick=async()=>{button.disabled=true;try{await call('world_invite',{target:person.id});$('world-search-status').textContent='Convite enviado. Espere a pessoa aceitar.';}catch(error){$('world-search-status').textContent=error.message;}finally{button.disabled=false;}};
      card.append(name,button);return card;
    }));
    $('world-search-status').textContent=data.results.length?'Confira o nome e envie um convite.':'Ninguém online com esse nome. Confira como seu amigo escreveu o nome.';
  }catch(error){$('world-search-status').textContent=error.message;}
});
$('world-invites').addEventListener('click',async event=>{
  const accept=event.target.dataset.worldAccept,decline=event.target.dataset.worldDecline;
  if(!accept&&!decline)return;
  event.target.disabled=true;
  try{const data=await call(accept?'world_accept':'world_decline',{invite:accept||decline});applyWorld(data);render(data);await refresh();}
  catch(error){$('world-search-status').textContent=error.message;event.target.disabled=false;}
});
$('world-leave').onclick=async()=>{
  try{const data=await call('world_leave');applyWorld(data);render(data);await refresh();$('world-search-status').textContent='Agora você está num mundo só seu.';}
  catch(error){$('world-search-status').textContent=error.message;}
};
