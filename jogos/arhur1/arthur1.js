(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const menu = $("menuScreen"), game = $("gameScreen"), play = $("playButton");
  const canvas = $("world"), ctx = canvas.getContext("2d");
  const dialogue = $("dialogue"), next = $("nextButton"), title = $("stageTitle");
  const scenes = [
    { title: "O quarto de Arthur", text: "Arthur estava no seu quarto, usando sua camiseta laranja, calça azul e tênis preto. Foi quando encontrou uma caneta verde brilhando perto da cama!" },
    { title: "A caneta mágica", text: "Arthur: “Que caneta diferente! Vou desenhar alguma coisa…” Ao encostar a caneta no guarda-roupa, seus desenhos começaram a brilhar." },
    { title: "O portal no guarda-roupa", text: "De repente, um portal mágico apareceu dentro do guarda-roupa! Curioso, Arthur atravessou a luz verde e deixou seu quarto para trás." },
    { title: "Um mundo diferente", text: "Do outro lado havia um mundo completamente diferente. Arthur encontrou uma menina de vestido verde e coroa. O nome dela era Princesa." },
    { title: "Arthur e Princesa", text: "Arthur: “Onde eu estou? Como faço para voltar para casa?” Princesa: “Você atravessou um portal mágico! Vamos descobrir juntos como voltar.”" },
    { title: "Arthur Reverso", text: "Antes que pudessem continuar a conversa, apareceu Arthur Reverso, vestido com um macacão todo preto. Sem dizer nada, ele começou a cavar o chão debaixo deles!" },
    { title: "A queda", text: "O buraco ficou enorme e o chão cedeu! Arthur caiu na escuridão… e foi parar em uma caverna subterrânea. Sua aventura estava só começando!" }
  ];
  let mode = "menu", scene = 0, sceneAt = 0, lastFrame = 0;
  let capoeira = null, capoeiraIntroStep = 0;
  let runner = null;
  let city = null;
  let classroom = null, classroomStep = 0;
  const typing = { phrases: ["O nosso planeta é legal", "É incrível o nosso planeta"], index: 0, remaining: 20, started: false };
  const typingPanel = $("typingPanel"), typingInput = $("typingInput");
  const normalizePhrase = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[.!?]/g, "").trim().replace(/\s+/g, " ");
  const classroomLines = [
    "Arthur e Princesa encontram a base de Arthur Reverso no espaço. Eles entram juntos para impedir que ele destrua a Terra!",
    "Reverso aparece e faz uma magia: a Princesa fica sob o encanto dele! Arthur: “Princesa, eu vou ajudar você a se libertar!”",
    "A batalha acontece em uma sala de 4º ano, com crianças de 9 e 10 anos. Elas lançam bolinhas mágicas! Arthur deve desviar com A/D, usar o escudo com W ou Espaço e clicar na estrela acima da Princesa para desfazer o encanto."
  ];
  let homeStep = 0;
  const homeLines = [
    "Arthur e Arthur Reverso atravessaram o portal juntos e chegaram ao quarto de Arthur! Mas Reverso começou a olhar para aquele mundo com uma ideia diferente…",
    "Arthur Reverso: “O mundo em que eu estava antes era indestrutível. Mas este aqui não é… Tive uma ideia brilhante! Será que posso ir pela Terra e destruí-la?”",
    "Antes que Arthur pudesse responder, Arthur Reverso saiu voando pela janela do quarto! Arthur: “Reverso, espera! Eu achei que éramos amigos…”",
    "Arthur ficou no quarto, triste. Ele tinha voltado para casa, mas não esperava ouvir aquilo de Reverso. O que será que vai acontecer agora?",
    "De repente, a Princesa chegou ao quarto de Arthur! Princesa: “Arthur, você não está sozinho. Vamos juntos impedir Reverso de destruir o planeta Terra!” Arthur: “Obrigado, Princesa. Vamos salvar nosso planeta!”",
    "Arthur e Princesa partem para a cidade. Há bolinhas espalhadas, mas algumas levam a caminhos falsos. No primeiro quarteirão, siga reto. Procure o sinal de três bolinhas para cima: esse é o caminho verdadeiro até o espaço!"
  ];
  const capoeiraLines = [
    "Arthur encontra uma escada na caverna. Ele sobe e chega de novo à terra mágica, onde Arthur Reverso está esperando!",
    "Arthur Reverso: “Eu vi você mexendo nas pedras!” Arthur: “Eu só estava tentando escapar!” Reverso: “Vamos resolver isso na roda de capoeira. Aqui ninguém se machuca!”",
    "Gingue com A/D. W faz o aú, S faz a negativa. J: meia-lua; K: rasteira; L: armada. Segure E para tocar o berimbau. Com energia cheia, L faz o especial Giro do Portal! Quem perde o ritmo sai da roda."
  ];
  const speech = window.speechSynthesis;
  const narratorButton = $("narratorButton");
  const replayNarration = $("replayNarration");
  let narrationEnabled = Boolean(speech && window.SpeechSynthesisUtterance);
  let narration = null;

  function refreshNarrator() {
    narratorButton.textContent = narrationEnabled ? "Narração: ligada" : "Narração: desligada";
    narratorButton.setAttribute("aria-pressed", String(narrationEnabled));
    replayNarration.disabled = !narrationEnabled;
  }

  function stopNarration() {
    narration = null;
    if (speech) speech.cancel();
  }

  function narrateScene() {
    stopNarration();
    if (!narrationEnabled || !["story", "capoeiraIntro", "capoeiraWon", "runIntro", "home", "classroomIntro", "classroomWon", "talkIntro", "talkEnding", "talkHome", "talkFlight", "talkTeaser"].includes(mode)) return;
    const utterance = new window.SpeechSynthesisUtterance(dialogue.textContent);
    const voices = speech.getVoices();
    const portuguese = voices.filter((voice) => /^pt[-_]BR$/i.test(voice.lang));
    const voice = portuguese.find((v) => /francisca|maria|luciana|vit[oó]ria|female/i.test(v.name))
      || portuguese[0] || voices.find((v) => /^pt\b/i.test(v.lang));
    if (voice) utterance.voice = voice;
    utterance.lang = "pt-BR";
    utterance.pitch = 1.55;
    utterance.rate = 0.95;
    utterance.volume = 1;
    utterance.onerror = (event) => {
      if (narration !== utterance || ["canceled", "interrupted"].includes(event.error)) return;
      narratorButton.title = "Não foi possível reproduzir a voz. Tente Ouvir novamente.";
    };
    narration = utterance;
    speech.speak(utterance);
  }

  narratorButton.addEventListener("click", () => {
    narrationEnabled = !narrationEnabled;
    refreshNarrator();
    if (narrationEnabled) narrateScene(); else stopNarration();
  });
  replayNarration.addEventListener("click", narrateScene);
  refreshNarrator();
  if (!speech || !window.SpeechSynthesisUtterance) {
    narratorButton.disabled = true;
    narratorButton.textContent = "Voz indisponível neste navegador";
  }
  const keys = new Set();
  const player = { x: 50, y: 438, vy: 0, grounded: true };
  const escape = { rocks: [], elapsed: 0, spawn: 0, lives: 3, invincible: 0 };
  const ESCAPE_DURATION = 30;
  const platforms = [
    { x: 0, y: 480, w: 235, h: 60 }, { x: 300, y: 430, w: 160, h: 110 },
    { x: 525, y: 380, w: 160, h: 160 }, { x: 755, y: 440, w: 205, h: 100 }
  ];
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  function line(x, y, a, b, color, width = 8) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(a, b); ctx.stroke();
  }
  function person(x, y, kind = "arthur", motion = 0, sad = false) {
    ctx.save(); ctx.translate(x, y);
    const princess = kind === "princess", reverse = kind === "reverse";
    const skin = reverse ? "#a9b4c8" : "#f2bc8c";
    line(-12, -42, -15 - motion, -6, reverse ? "#11121b" : "#2965cc", 15);
    line(12, -42, 15 + motion, -6, reverse ? "#11121b" : "#2965cc", 15);
    line(-15 - motion, -4, -25 - motion, -4, "#11121b", 10);
    line(15 + motion, -4, 25 + motion, -4, "#11121b", 10);
    if (princess) {
      ctx.fillStyle = "#35b565"; ctx.beginPath(); ctx.moveTo(-15, -90); ctx.lineTo(15, -90);
      ctx.lineTo(35, -15); ctx.lineTo(-35, -15); ctx.fill();
    } else rect(-20, -95, 40, 57, reverse ? "#11121b" : "#ff8c27");
    line(-22, -83, -36, -48 + motion, reverse ? "#11121b" : skin, 10);
    line(22, -83, 38, -55 - motion, reverse ? "#11121b" : skin, 10);
    circle(0, -116, 23, skin);
    ctx.fillStyle = reverse ? "#12131c" : "#563622";
    ctx.beginPath(); ctx.arc(0, -121, 24, Math.PI, Math.PI * 2); ctx.fill();
    circle(-8, -116, 2.5, "#19243b"); circle(8, -116, 2.5, "#19243b");
    if (sad) {
      ctx.strokeStyle = "#ad654b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -100, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      line(-13, -124, -5, -127, "#563622", 2); line(5, -127, 13, -124, "#563622", 2);
      circle(10, -107, 3, "#74c6ef");
    } else line(-5, -105, 5, -105, "#ad654b", 2);
    if (princess) {
      ctx.fillStyle = "#ffe065"; ctx.beginPath(); ctx.moveTo(-22, -139); ctx.lineTo(-25, -162);
      ctx.lineTo(-9, -151); ctx.lineTo(0, -170); ctx.lineTo(9, -151); ctx.lineTo(25, -162);
      ctx.lineTo(22, -139); ctx.closePath(); ctx.fill(); circle(0, -150, 4, "#40c788");
    }
    ctx.restore();
  }
  function portal(time) {
    ctx.save(); ctx.translate(735, 260);
    const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 145);
    glow.addColorStop(0, "#baffde"); glow.addColorStop(.65, "#31dc9a"); glow.addColorStop(1, "#153e68");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(0, 0, 90, 140, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 20; i++) {
      const a = i * Math.PI / 10 + time / 1300;
      circle(Math.cos(a) * 75, Math.sin(a) * 120, 3 + i % 3, "#e4ff86");
    }
    ctx.restore();
  }
  function room(time, ending = false, hideArthur = false, hidePrincess = false) {
    rect(0, 0, 960, 540, "#f2d9b6"); rect(0, 410, 960, 130, "#ab7555");
    for (let i = 0; i < 9; i++) line(i * 120, 410, i * 120 - 100, 540, "#986246", 2);
    rect(80, 70, 180, 160, "#fff3cf"); rect(90, 80, 160, 140, "#83ceec");
    circle(205, 115, 22, "#fff0a0"); line(170, 80, 170, 220, "#fff3cf", 8);
    rect(55, 338, 295, 95, "#6d493c"); rect(55, 326, 295, 52, "#5289bd"); rect(75, 328, 80, 28, "#f5efdf");
    rect(620, 76, 230, 350, "#684737"); rect(633, 88, 102, 326, "#956341"); rect(745, 88, 92, 326, "#956341");
    circle(723, 265, 5, "#ffe065"); circle(758, 265, 5, "#ffe065");
    if (ending) {
      if (!hideArthur) person(430, 440, "arthur", 0, homeStep >= 2 && homeStep < 4);
      if (homeStep >= 4 && !hidePrincess) person(560, 440, "princess");
      if (homeStep < 2) person(545, 440, "reverse");
      else if (homeStep === 2) {
        const flight = Math.min(1, (time - sceneAt) / 2300);
        // A janela fica aberta enquanto Reverso atravessa e voa para fora.
        rect(90, 80, 160, 140, "#83ceec");
        if (flight < 1) {
          ctx.save(); ctx.translate(545 - flight * 570, 440 - flight * 280); ctx.rotate(-flight * .6);
          person(0, 0, "reverse", 14); ctx.restore();
        }
      }
      return;
    }
    if (scene >= 2) portal(time);
    const progress = Math.min((time - sceneAt) / 2200, 1);
    const x = scene === 2 ? 465 + progress * 205 : scene === 1 ? 560 : 430;
    person(x, 440, "arthur", Math.sin(time / 200) * 3);
    if (scene === 0) line(355, 405, 377, 387, "#1adb66", 7);
    else line(x + 38, 388, x + 56, 365, "#1adb66", 6);
    if (scene === 1) {
      ctx.strokeStyle = "#52ec9b"; ctx.lineWidth = 5; ctx.beginPath();
      ctx.arc(700, 260, 50, -.5, Math.PI * 1.5 * progress); ctx.stroke();
    }
  }
  function magicWorld(time) {
    const sky = ctx.createLinearGradient(0, 0, 0, 440); sky.addColorStop(0, "#483478"); sky.addColorStop(1, "#d39ac3");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 960, 540);
    circle(800, 85, 42, "#ffdfa9"); circle(175, 90, 20, "#bbf4df");
    for (let i = 0; i < 12; i++) circle(i * 83 + 20, 45 + i % 3 * 50, 2, "#fff5d9");
    for (const x of [60, 860]) { rect(x, 260, 20, 175, "#70437a"); circle(x + 10, 240, 70, "#3eb998"); circle(x - 15, 215, 40, "#70d5aa"); }
    rect(0, 435, 960, 105, "#508863"); rect(0, 435, 960, 14, "#97d18e");
    if (scene >= 5) {
      const radius = scene === 6 ? 170 : 45 + Math.min((time - sceneAt) / 80, 70);
      ctx.fillStyle = "#171727"; ctx.beginPath(); ctx.ellipse(490, 459, radius, radius * .24, 0, 0, Math.PI * 2); ctx.fill();
      person(670, 435, "reverse", Math.sin(time / 130) * 14);
      line(698, 373, 746, 455, "#b99a77", 7); rect(736, 448, 27, 20, "#8797a7");
    }
    const fall = scene === 6 ? Math.min((time - sceneAt) / 1500, 1) * 220 : 0;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 960, scene === 6 ? 490 : 540); ctx.clip();
    person(430, 435 + fall, "arthur", Math.sin(time / 180) * 4); ctx.restore();
    person(560, 435, "princess");
    if (scene === 6) { ctx.fillStyle = `rgba(10, 12, 28, ${Math.min(fall / 280, .75)})`; ctx.fillRect(0, 0, 960, 540); }
  }
  function showScene(index) {
    scene = index; sceneAt = performance.now();
    title.textContent = scenes[index].title; dialogue.textContent = scenes[index].text;
    canvas.setAttribute("aria-label", scenes[index].title);
    next.textContent = index === scenes.length - 1 ? "Entrar na Caverna →" : "Continuar →";
    narratorButton.hidden = false; replayNarration.hidden = false;
    narrateScene();
  }
  function beginCave() {
    stopNarration();
    narratorButton.hidden = true; replayNarration.hidden = true;
    mode = "cave"; keys.clear(); Object.assign(player, { x: 50, y: 438, vy: 0, grounded: true });
    title.textContent = "Fase 1 — A Caverna";
    canvas.setAttribute("aria-label", "A Caverna: pule entre as plataformas e alcance a luz à direita.");
    dialogue.textContent = "Arthur precisa explorar a caverna! Use ← → ou A/D para andar e Espaço para pular. Alcance a luz do outro lado.";
    next.hidden = true; $("touchControls").hidden = false; title.focus();
    document.querySelector('[data-control="jump"]').hidden = false;
  }
  function beginCapoeiraIntro() {
    if (capoeira) capoeira.stop();
    capoeira = window.ArthurCapoeira.create(); mode = "capoeiraIntro"; capoeiraIntroStep = 0; sceneAt = performance.now(); keys.clear();
    title.textContent = "Fase 3 — A luta de capoeira";
    canvas.setAttribute("aria-label", "Arthur sobe a escada e encontra Arthur Reverso na roda de capoeira.");
    $("touchControls").hidden = true; $("capoeiraControls").hidden = true;
    narratorButton.hidden = false; replayNarration.hidden = false;
    dialogue.textContent = capoeiraLines[0]; next.textContent = "Continuar →"; next.hidden = false;
    title.focus(); narrateScene();
  }
  function beginCapoeira() {
    stopNarration(); if (capoeira) capoeira.stop();
    capoeira = window.ArthurCapoeira.create(); capoeira.enableAudio(); mode = "capoeira"; keys.clear();
    dialogue.textContent = capoeiraLines[2]; next.hidden = true;
    narratorButton.hidden = true; replayNarration.hidden = true;
    $("touchControls").hidden = false; document.querySelector('[data-control="jump"]').hidden = false;
    $("capoeiraControls").hidden = false; title.focus();
  }
  function finishCapoeira(result) {
    capoeira.stop(); keys.clear(); mode = result === "won" ? "capoeiraWon" : "capoeiraLost";
    $("touchControls").hidden = true; $("capoeiraControls").hidden = true;
    dialogue.textContent = result === "won"
      ? "Reverso sai da roda e reconhece: “Você joga bem, Arthur! Eu entendi errado. Você não estava mexendo nas pedras, estava fugindo delas. Desculpa!” Arthur: “Tudo bem! Vamos seguir juntos.” O caminho para a próxima fase se abre!"
      : "Arthur sai da roda e reconhece o jogo de Reverso. Ninguém se machucou! Tente de novo: pule a rasteira, agache para a armada e aproxime-se gingando.";
    next.textContent = result === "won" ? "Fase 4: A corrida e o lápis →" : "Jogar a roda novamente"; next.hidden = false; next.focus();
    if (result === "won") { narratorButton.hidden = false; replayNarration.hidden = false; narrateScene(); }
  }
  function beginRunIntro() {
    if (capoeira) capoeira.stop(); keys.clear(); runner = window.ArthurRunner.create(); mode = "runIntro";
    title.textContent = "Fase 4 — A corrida infinita e o lápis";
    dialogue.textContent = "Arthur e Reverso fazem as pazes e correm juntos pela terra mágica! Um lápis está escondido no caminho: ele é a chave para Arthur voltar para casa. Pule os obstáculos com W, Espaço ou Pular. A/D move para os lados.";
    canvas.setAttribute("aria-label", "Arthur e Arthur Reverso correm juntos para encontrar o lápis.");
    $("touchControls").hidden = true; $("capoeiraControls").hidden = true;
    next.textContent = "Começar a corrida →"; next.hidden = false;
    narratorButton.hidden = false; replayNarration.hidden = false; title.focus(); narrateScene();
  }
  function beginRun() {
    stopNarration(); keys.clear(); runner = window.ArthurRunner.create(); mode = "run";
    next.hidden = true; narratorButton.hidden = true; replayNarration.hidden = true;
    $("touchControls").hidden = false; document.querySelector('[data-control="jump"]').hidden = false;
    canvas.style.cursor = "default";
    dialogue.textContent = "Corram juntos! Pule as pedras. Em 30 segundos vocês chegam ao esconderijo do lápis.";
  }
  function updateRun(dt) {
    const result = runner.update(dt, keys);
    if (result === "search" && mode === "run") {
      mode = "search"; keys.clear(); $("touchControls").hidden = true;
      dialogue.textContent = "Vocês chegaram! Mova o mouse sobre os objetos e procure o lápis. Quando ele brilhar, clique nele! No celular, toque no lápis.";
      canvas.setAttribute("aria-label", "Procure o lápis entre os objetos da caixa à direita e clique ou toque nele.");
      canvas.style.cursor = "crosshair";
    } else if (result === "lost" && mode === "run") {
      mode = "runLost"; keys.clear(); $("touchControls").hidden = true;
      dialogue.textContent = "Uma pedra atrapalhou a corrida. Arthur e Reverso vão tentar juntos novamente!";
      next.textContent = "Tentar a corrida novamente"; next.hidden = false; next.focus();
    } else if (result === "home" && mode === "returning") {
      mode = "home"; scene = 0; homeStep = 0; canvas.style.cursor = "default";
      narratorButton.hidden = false; replayNarration.hidden = false;
      next.hidden = false; showHomeScene(); next.focus();
    }
  }
  function showHomeScene() {
    sceneAt = performance.now();
    title.textContent = ["Os dois voltaram para casa", "A ideia de Reverso", "Pela janela!", "Arthur ficou triste", "A Princesa chegou!", "Juntos pela Terra"][homeStep];
    dialogue.textContent = homeLines[homeStep];
    canvas.setAttribute("aria-label", title.textContent);
    next.textContent = homeStep === homeLines.length - 1 ? "Fase 5: O caminho das bolinhas →" : "Continuar →";
    narrateScene();
  }
  function beginCity() {
    stopNarration(); keys.clear(); city = window.ArthurCity.create(); mode = "city";
    title.textContent = "Fase 5 — A cidade e o caminho das bolinhas";
    dialogue.textContent = city.state.flash;
    canvas.setAttribute("aria-label", "Arthur e Princesa atravessam a cidade. Ande com A/D ou as setas. Clique nas bolinhas e siga o sinal de três para cima.");
    canvas.style.cursor = "pointer";
    narratorButton.hidden = true; replayNarration.hidden = true; next.hidden = true;
    $("capoeiraControls").hidden = true; $("touchControls").hidden = false;
    document.querySelector('[data-control="jump"]').hidden = true; title.focus();
  }
  function selectCityBall(x, y) {
    const result = city.click(x, y);
    dialogue.textContent = city.state.flash;
    if (result === "false") {
      mode = "cityDeadEnd"; keys.clear(); $("touchControls").hidden = true;
      next.textContent = "Voltar e seguir reto →"; next.hidden = false; next.focus();
    } else if (result === "won") {
      mode = "cityWon"; keys.clear(); $("touchControls").hidden = true;
      title.textContent = "Arthur e Princesa chegaram ao espaço!";
      dialogue.textContent = "As três bolinhas eram o caminho verdadeiro! Arthur e Princesa chegaram juntos ao espaço. A busca por Reverso continua para proteger a Terra.";
      next.textContent = "Fase 6: A base de Reverso →"; next.hidden = false; next.focus();
    }
  }
  function beginClassroomIntro() {
    stopNarration(); keys.clear(); classroom = window.ArthurClassroom.create(); classroomStep = 0; mode = "classroomIntro";
    title.textContent = "Fase 6 — A base de Reverso"; dialogue.textContent = classroomLines[0];
    canvas.style.cursor = "default"; canvas.setAttribute("aria-label", "A base de Arthur Reverso e a batalha na sala do quarto ano.");
    $("touchControls").hidden = true; next.hidden = false; next.textContent = "Continuar →";
    narratorButton.hidden = false; replayNarration.hidden = false; title.focus(); narrateScene();
  }
  function beginClassroom() {
    stopNarration(); keys.clear(); classroom = window.ArthurClassroom.create(); mode = "classroom";
    title.textContent = "Fase 6 — O encanto da Princesa"; dialogue.textContent = classroomLines[2];
    narratorButton.hidden = true; replayNarration.hidden = true; next.hidden = true;
    $("touchControls").hidden = false;
    const shield = document.querySelector('[data-control="jump"]'); shield.hidden = false; shield.textContent = "Escudo ↑";
    canvas.style.cursor = "pointer"; title.focus();
  }
  function finishClassroom(result) {
    mode = result === "won" ? "classroomWon" : "classroomLost"; keys.clear(); $("touchControls").hidden = true;
    dialogue.textContent = result === "won" ? "O encanto se desfez! Princesa: “Arthur, você conseguiu! Eu voltei a ser eu mesma.” As bolinhas mágicas param. Juntos, os dois continuam tentando proteger a Terra de Reverso."
      : "Arthur precisa recuperar a coragem! Tente de novo: desvie das bolinhas, use o escudo e clique na estrela da Princesa para quebrar o encanto.";
    classroom.state.bullets = []; next.textContent = result === "won" ? "Batalha final: a conversa →" : "Jogar a sala novamente"; next.hidden = false; next.focus();
    canvas.style.cursor = "default";
    if (result === "won") { narratorButton.hidden = false; replayNarration.hidden = false; narrateScene(); }
  }
  function beginTalkIntro() {
    stopNarration(); keys.clear(); mode = "talkIntro";
    title.textContent = "Batalha final — Uma conversa pela Terra";
    dialogue.textContent = "O encanto da Princesa sumiu! Agora Arthur vai conversar com Reverso para salvar a Terra. Digite as duas frases sobre nosso planeta, o mais rápido que conseguir. Você tem 20 segundos para cada frase, contando a partir da primeira letra. Acentos e letras maiúsculas são opcionais.";
    $("touchControls").hidden = true; typingPanel.hidden = true;
    narratorButton.hidden = false; replayNarration.hidden = false;
    next.textContent = "Começar a conversa →"; next.hidden = false; title.focus(); narrateScene();
  }
  function setTypingPhrase() {
    typing.remaining = 20; typing.started = false; typingInput.value = ""; typingInput.disabled = false;
    $("typingPhrase").textContent = typing.phrases[typing.index];
    $("typingTimer").textContent = `Frase ${typing.index + 1}/2 · 20s · Comece a digitar!`;
    typingInput.focus();
  }
  function beginTalk() {
    stopNarration(); mode = "talk"; typing.index = 0; typingPanel.hidden = false;
    next.hidden = true; narratorButton.hidden = true; replayNarration.hidden = true;
    dialogue.textContent = "Arthur: “Reverso, escuta! Nosso planeta merece ser protegido.”";
    setTypingPhrase();
  }
  function checkTyping() {
    if (mode !== "talk") return;
    typing.started = true;
    if (normalizePhrase(typingInput.value) !== normalizePhrase(typing.phrases[typing.index])) return;
    typing.index++;
    if (typing.index < typing.phrases.length) {
      dialogue.textContent = "Reverso: “Você acha mesmo? Me conte mais sobre esse planeta…”"; setTypingPhrase();
    } else {
      mode = "talkEnding"; typingPanel.hidden = true;
      dialogue.textContent = "Arthur Reverso pensa nas palavras de Arthur. “Você tem razão. O nosso planeta é incrível! Eu não vou destruir a Terra.” Princesa: “Você fez a escolha certa!” Reverso abre um portal e volta para o quarto de Arthur.";
      narratorButton.hidden = false; replayNarration.hidden = false;
      next.textContent = "Voltar ao quarto →"; next.hidden = false; next.focus(); narrateScene();
    }
  }
  typingInput.addEventListener("input", checkTyping);
  function updateTyping(dt) {
    if (!typing.started) return;
    typing.remaining = Math.max(0, typing.remaining - dt);
    const message = `Frase ${typing.index + 1}/2 · ${Math.ceil(typing.remaining)}s`;
    if ($("typingTimer").textContent !== message) $("typingTimer").textContent = message;
    if (typing.remaining === 0) {
      mode = "talkLost"; typingInput.disabled = true;
      dialogue.textContent = "O tempo acabou, mas a conversa pode continuar! Tente novamente e digite as frases com calma e rapidez.";
      next.textContent = "Tentar a conversa novamente"; next.hidden = false; next.focus();
    }
  }
  function drawTalk(time) {
    if (mode === "talkFlight") {
      room(time, true, false, true);
      const progress = Math.min(1, Math.max(0, (time - sceneAt) / 3500));
      const princessX = 560 + (170 - 560) * progress;
      const princessY = 440 + (230 - 440) * progress;
      person(princessX, princessY, "princess");
      ctx.strokeStyle = "#b77aff"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(princessX, princessY - 85, 65, 100, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const angle = time / 900 + i * Math.PI / 6;
        circle(princessX + Math.cos(angle) * 65, princessY - 85 + Math.sin(angle) * 100, 4, "#e5baff");
      }
      ctx.fillStyle = "#183e75"; ctx.font = "bold 26px Arial"; ctx.textAlign = "center";
      if (progress === 1) ctx.fillText("Fim do jogo", 480, 50);
      return;
    }
    if (mode === "talkHome") {
      room(time, true); person(710, 440, "reverse"); return;
    }
    ctx.fillStyle = "#182b41"; ctx.fillRect(0, 0, 960, 540);
    circle(480, 215, 120, "#4f9dd6");
    circle(430, 170, 35, "#68be81"); circle(520, 245, 48, "#68be81"); circle(480, 305, 17, "#68be81");
    rect(0, 445, 960, 95, "#657688");
    person(250, 455, "arthur"); person(360, 455, "princess"); person(730, 455, "reverse");
    ctx.textAlign = "center"; ctx.fillStyle = "#ffe36b"; ctx.font = "bold 24px Arial";
    ctx.fillText("Uma conversa pode mudar tudo", 480, 70);
    if (mode === "talkEnding") {
      ctx.strokeStyle = "#50e2a2"; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(840, 335, 60, 115, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function beginEscape() {
    stopNarration(); mode = "escape"; keys.clear();
    Object.assign(player, { x: 480, y: 438, vy: 0, grounded: true });
    Object.assign(escape, { rocks: [], elapsed: 0, spawn: 0.6, lives: 3, invincible: 0 });
    title.textContent = "Fase 2 — Fuga das pedras";
    dialogue.textContent = "Pedras estão caindo e uma sombra misteriosa se aproxima! Desvie por 30 segundos. A/← anda para a esquerda e D/→ para a direita. Você tem 3 chances.";
    canvas.setAttribute("aria-label", "Fuga das pedras: evite as pedras que caem. Os círculos amarelos avisam onde elas vão cair.");
    next.hidden = true; $("touchControls").hidden = false;
    document.querySelector('[data-control="jump"]').hidden = true;
    narratorButton.hidden = true; replayNarration.hidden = true; title.focus();
  }
  function finishEscape(won) {
    mode = won ? "escapeWon" : "escapeLost"; keys.clear(); $("touchControls").hidden = true;
    dialogue.textContent = won ? "Arthur escapou das pedras! Mas de quem era aquela sombra misteriosa?" : "As pedras pegaram Arthur! Tente novamente e fique de olho nos avisos amarelos.";
    next.textContent = won ? "Fase 3: A luta de capoeira →" : "Tentar novamente";
    next.hidden = false; next.focus();
  }
  function updateEscape(dt) {
    escape.elapsed += dt; escape.spawn -= dt; escape.invincible = Math.max(0, escape.invincible - dt);
    const dx = Number(keys.has("right")) - Number(keys.has("left"));
    player.x = Math.max(28, Math.min(932, player.x + dx * 300 * dt));
    if (escape.spawn <= 0) {
      escape.rocks.push({ x: 40 + Math.random() * 880, y: -35, r: 18 + Math.random() * 12, warning: 0.9, speed: 220 + escape.elapsed * 5 });
      escape.spawn = Math.max(0.4, 1 - escape.elapsed * 0.02);
    }
    for (const rock of escape.rocks) {
      if (rock.warning > 0) { rock.warning -= dt; continue; }
      rock.y += rock.speed * dt;
      // Circle against the visible body, including Arthur's head.
      const nearestX = Math.max(player.x - 22, Math.min(rock.x, player.x + 22));
      const nearestY = Math.max(341, Math.min(rock.y, 480));
      if (!rock.hit && escape.invincible === 0 && Math.hypot(rock.x - nearestX, rock.y - nearestY) < rock.r) {
        rock.hit = true; escape.lives--; escape.invincible = 1.2;
        dialogue.textContent = `Cuidado! Restam ${escape.lives} chances. Desvie dos círculos amarelos!`;
        if (escape.lives === 0) { finishEscape(false); return; }
      }
    }
    escape.rocks = escape.rocks.filter((rock) => rock.y < 580 && !rock.hit);
    if (escape.elapsed >= ESCAPE_DURATION) finishEscape(true);
  }
  function jump() {
    if (mode === "classroom") { classroom.shield(); return; }
    if (mode === "run") { runner.jump(); return; }
    if (mode === "capoeira") capoeira.action("jump");
    else if (mode === "cave" && player.grounded) { player.vy = -520; player.grounded = false; }
  }
  function update(dt) {
    if (mode === "talk") { updateTyping(dt); return; }
    if (mode === "classroom") { const result = classroom.update(dt, keys); if (result) finishClassroom(result); return; }
    if (mode === "city") { city.update(dt, keys); if (dialogue.textContent !== city.state.flash) dialogue.textContent = city.state.flash; return; }
    if (["run", "returning"].includes(mode)) { updateRun(dt); return; }
    if (mode === "capoeira") { const result = capoeira.update(dt, keys); if (result) finishCapoeira(result); return; }
    if (mode === "escape") { updateEscape(dt); return; }
    if (mode !== "cave") return;
    const dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
    player.x = Math.max(18, Math.min(942, player.x + dx * 230 * dt));
    const previousFeet = player.y + 42;
    player.vy += 1250 * dt; player.y += player.vy * dt; player.grounded = false;
    for (const p of platforms) {
      if (player.x + 16 > p.x && player.x - 16 < p.x + p.w && player.vy >= 0 && previousFeet <= p.y + 1 && player.y + 42 >= p.y) {
        player.y = p.y - 42; player.vy = 0; player.grounded = true;
      }
    }
    if (player.y > 620) { Object.assign(player, { x: 50, y: 438, vy: 0, grounded: true }); dialogue.textContent = "Vamos tentar de novo! Pule perto da borda para alcançar a próxima plataforma."; }
    if (player.x > 890 && player.grounded) {
      mode = "complete"; keys.clear(); $("touchControls").hidden = true;
      dialogue.textContent = "Boa, Arthur! Você atravessou a caverna. A aventura continua…";
      next.textContent = "Fase 2: Fuga das pedras →"; next.hidden = false; next.focus();
    }
  }
  function cave(time) {
    rect(0, 0, 960, 540, "#151c2d");
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 ? "#283047" : "#222940"; ctx.beginPath();
      ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64 + 32, 70 + i % 4 * 23); ctx.lineTo(i * 64 + 64, 0); ctx.fill();
    }
    for (const p of platforms) { rect(p.x, p.y, p.w, p.h, "#4b4655"); rect(p.x, p.y, p.w, 10, "#7a7487"); }
    for (const x of [170, 580, 840]) {
      const light = ctx.createRadialGradient(x, 300, 0, x, 300, 100); light.addColorStop(0, "#65e6cd44"); light.addColorStop(1, "#65e6cd00");
      ctx.fillStyle = light; ctx.fillRect(x - 100, 200, 200, 200);
      line(x, 320, x + 10, 282 + Math.sin(time / 600) * 2, "#66dccb", 7);
    }
    rect(890, 310, 45, 130, "#f9e19d"); rect(902, 325, 20, 115, "#fff6d5");
    person(player.x, player.y + 42, "arthur", keys.size && player.grounded ? Math.sin(time / 90) * 7 : 0);
  }
  function drawEscape(time) {
    rect(0, 0, 960, 540, "#111827"); rect(0, 480, 960, 60, "#5a5260");
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = "#303347"; ctx.beginPath(); ctx.moveTo(i * 64, 0);
      ctx.lineTo(i * 64 + 30, 45 + i % 4 * 15); ctx.lineTo(i * 64 + 64, 0); ctx.fill();
    }
    ctx.save(); ctx.globalAlpha = 0.2 + 0.08 * Math.sin(time / 700);
    person(820 - escape.elapsed * 8, 465, "reverse"); ctx.restore();
    for (const rock of escape.rocks) {
      if (rock.warning > 0) {
        ctx.strokeStyle = "#ffe36b"; ctx.lineWidth = 3; ctx.beginPath();
        ctx.ellipse(rock.x, 474, rock.r + 10, 6, 0, 0, Math.PI * 2); ctx.stroke();
        line(rock.x, 100, rock.x, 127, "#ffe36b", 4); circle(rock.x, 138, 3, "#ffe36b");
      } else { circle(rock.x, rock.y, rock.r, "#827b87"); line(rock.x - 7, rock.y - 7, rock.x + 6, rock.y + 4, "#aea6ad", 4); }
    }
    if (escape.invincible === 0 || Math.floor(time / 100) % 2 === 0) person(player.x, 480, "arthur", keys.size ? Math.sin(time / 90) * 7 : 0);
    ctx.fillStyle = "#fff3cf"; ctx.font = "bold 24px Arial"; ctx.textAlign = "left";
    ctx.fillText(`Chances: ${escape.lives}`, 20, 40);
    ctx.textAlign = "right"; ctx.fillText(`Faltam ${Math.max(0, Math.ceil(ESCAPE_DURATION - escape.elapsed))}s`, 940, 40);
    rect(20, 55, 920, 8, "#394155"); rect(20, 55, 920 * Math.min(1, escape.elapsed / ESCAPE_DURATION), 8, "#82e2ba");
  }
  function frame(time) {
    const dt = Math.min((time - lastFrame) / 1000 || 0, .035); lastFrame = time;
    if (mode !== "menu") {
      update(dt);
      if (mode === "story") { if (scene < 3) room(time); else magicWorld(time); }
      else if (mode.startsWith("talk")) drawTalk(time);
      else if (mode === "home") room(time, true);
      else if (mode.startsWith("classroom")) window.ArthurClassroom.draw(ctx, classroom, time, person, mode === "classroomIntro" ? classroomStep : -1);
      else if (["city", "cityDeadEnd", "cityWon"].includes(mode)) window.ArthurCity.draw(ctx, city, time, person);
      else if (["runIntro", "run", "search", "runLost", "returning"].includes(mode)) window.ArthurRunner.draw(ctx, runner, time, person);
      else if (mode.startsWith("capoeira")) {
        window.ArthurCapoeira.draw(ctx, capoeira, time, person, mode === "capoeiraIntro", capoeiraIntroStep, time - sceneAt);
        if (mode === "capoeiraWon") {
          rect(875, 345, 60, 100, "#fff2af");
          ctx.fillStyle = "#173c30"; ctx.font = "bold 18px Arial"; ctx.textAlign = "center"; ctx.fillText("Caminho aberto", 820, 320);
        }
      }
      else if (["escape", "escapeWon", "escapeLost"].includes(mode)) drawEscape(time);
      else cave(time);
    }
    requestAnimationFrame(frame);
  }
  play.addEventListener("click", () => {
    typingPanel.hidden = true;
    document.querySelector('[data-control="jump"]').textContent = "Pular ↑";
    if (capoeira) capoeira.stop(); $("capoeiraControls").hidden = true;
    mode = "story"; menu.hidden = true; game.hidden = false; keys.clear();
    next.hidden = false; $("touchControls").hidden = true; showScene(0); title.focus();
  });
  next.addEventListener("click", () => {
    if (mode === "capoeiraWon") beginRunIntro();
    else if (["runIntro", "runLost"].includes(mode)) beginRun();
    else if (mode === "home") {
      if (homeStep < homeLines.length - 1) { homeStep++; showHomeScene(); }
      else beginCity();
    }
    else if (mode === "cityDeadEnd") {
      city.resume(); mode = "city"; next.hidden = true; $("touchControls").hidden = false;
      dialogue.textContent = city.state.flash;
    }
    else if (mode === "cityWon") beginClassroomIntro();
    else if (mode === "classroomIntro") {
      if (++classroomStep >= classroomLines.length) beginClassroom();
      else { dialogue.textContent = classroomLines[classroomStep]; next.textContent = classroomStep === 2 ? "Começar a batalha →" : "Continuar →"; narrateScene(); }
    }
    else if (mode === "classroomWon") beginTalkIntro();
    else if (mode === "classroomLost") beginClassroom();
    else if (["talkIntro", "talkLost"].includes(mode)) beginTalk();
    else if (mode === "talkEnding") {
      mode = "talkHome"; homeStep = 4; title.textContent = "A Terra está salva!";
      dialogue.textContent = "Reverso voltou ao quarto de Arthur e desistiu de destruir o planeta. Arthur e Princesa conseguiram salvar a Terra com uma conversa!";
      next.textContent = "Continuar →"; narrateScene();
    }
    else if (mode === "talkHome") {
      mode = "talkFlight"; sceneAt = performance.now();
      title.textContent = "A magia leva a Princesa até a janela";
      dialogue.textContent = "Uma magia envolve a Princesa e a leva até a janela. Arthur fica parado, apenas olhando. Fim do jogo.";
      next.textContent = "Jogar a aventura novamente"; canvas.setAttribute("aria-label", "Arthur fica parado olhando enquanto a magia leva a Princesa até a janela. Fim do jogo."); narrateScene();
    }
    else if (mode === "talkFlight") play.click();
    else if (mode === "escapeWon") beginCapoeiraIntro();
    else if (mode === "capoeiraIntro") {
      if (++capoeiraIntroStep >= capoeiraLines.length) beginCapoeira();
      else { sceneAt = performance.now(); dialogue.textContent = capoeiraLines[capoeiraIntroStep]; next.textContent = capoeiraIntroStep === 2 ? "Entrar na roda →" : "Continuar →"; narrateScene(); }
    }
    else if (mode === "capoeiraLost") beginCapoeira();
    else if (["complete", "escapeLost"].includes(mode)) beginEscape();
    else if (mode === "story" && scene === scenes.length - 1) beginCave();
    else if (mode === "story") showScene(scene + 1);
  });
  $("backButton").addEventListener("click", () => { stopNarration(); if (capoeira) capoeira.stop(); canvas.style.cursor = "default"; mode = "menu"; keys.clear(); game.hidden = true; menu.hidden = false; play.focus(); });
  window.addEventListener("pagehide", () => { stopNarration(); if (capoeira) capoeira.stop(); });
  const mapping = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
  window.addEventListener("keydown", (event) => {
    if (!["cave", "escape", "capoeira", "run", "city", "classroom"].includes(mode)) return;
    if (mode === "capoeira") {
      const action = { KeyS: "crouch", KeyJ: "meia", KeyK: "rasteira", KeyL: "armada", KeyE: "music" }[event.code];
      if (action) { event.preventDefault(); if (["crouch", "music"].includes(action)) keys.add(action); if (!event.repeat) capoeira.action(action); return; }
    }
    if (mapping[event.code]) { event.preventDefault(); keys.add(mapping[event.code]); }
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") { event.preventDefault(); if (!event.repeat) jump(); }
  });
  window.addEventListener("keyup", (event) => { if (mapping[event.code]) keys.delete(mapping[event.code]); if (event.code === "KeyS") keys.delete("crouch"); if (event.code === "KeyE") keys.delete("music"); });
  window.addEventListener("blur", () => keys.clear());
  document.querySelectorAll("[data-control]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      if (button.dataset.control === "jump") jump(); else keys.add(button.dataset.control);
    });
    const release = () => keys.delete(button.dataset.control);
    button.addEventListener("pointerup", release); button.addEventListener("pointercancel", release); button.addEventListener("lostpointercapture", release);
    button.addEventListener("click", (event) => { if (event.detail === 0 && button.dataset.control === "jump") jump(); });
  });
  document.querySelectorAll("[data-capoeira]").forEach((button) => {
    const action = button.dataset.capoeira;
    button.addEventListener("pointerdown", (event) => {
      if (mode !== "capoeira") return;
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      if (["crouch", "music"].includes(action)) keys.add(action);
      capoeira.action(action);
    });
    const release = () => keys.delete(action);
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(event, release);
    button.addEventListener("click", (event) => { if (mode === "capoeira" && event.detail === 0) capoeira.action(action); });
  });
  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  }
  canvas.addEventListener("pointermove", (event) => {
    if (mode !== "search") return;
    const p = canvasPoint(event);
    canvas.style.cursor = runner.point(p.x, p.y) ? "pointer" : "crosshair";
  });
  canvas.addEventListener("pointerleave", () => { if (mode === "search") { runner.state.pointer = null; runner.state.hovered = false; } });
  canvas.addEventListener("click", (event) => {
    if (mode === "classroom") { const p = canvasPoint(event); classroom.click(p.x, p.y); return; }
    if (mode === "city") { const p = canvasPoint(event); selectCityBall(p.x, p.y); return; }
    if (mode !== "search") return;
    const p = canvasPoint(event);
    if (runner.click(p.x, p.y)) {
      mode = "returning"; canvas.style.cursor = "default";
      dialogue.textContent = "Você encontrou o lápis! Reverso vai buscá-lo. Arthur desenha um portal e os dois voltam juntos para o quarto…";
    }
  });
  requestAnimationFrame(frame);
})();
