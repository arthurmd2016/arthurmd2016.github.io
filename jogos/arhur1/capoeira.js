(() => {
  "use strict";
  const attacks = {
    meia: { name: "Meia-lua de compasso", height: "high", damage: 12, delay: .22, duration: .65 },
    rasteira: { name: "Rasteira", height: "low", damage: 10, delay: .28, duration: .75 },
    armada: { name: "Armada", height: "high", damage: 22, delay: .65, duration: 1.15 },
    special: { name: "Giro do Portal", height: "high", damage: 32, delay: .4, duration: 1.05 }
  };
  function create() {
    const fighter = (x) => ({ x, rhythm: 100, jump: 0, crouch: false, attack: null, cooldown: 0 });
    const state = { arthur: fighter(350), reverse: fighter(610), energy: 0, time: 0, aiTimer: 2, flash: "Entre na roda!", audio: null, beat: -1, result: null };
    function sound(high = false) {
      const c = state.audio;
      if (!c || c.state !== "running") return;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.frequency.value = high ? 330 : 220; osc.type = "sine";
      gain.gain.setValueAtTime(.045, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, c.currentTime + .22);
      osc.connect(gain); gain.connect(c.destination); osc.start(); osc.stop(c.currentTime + .24);
    }
    function enableAudio() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio && !state.audio) state.audio = new Audio();
      if (state.audio) state.audio.resume().catch(() => {});
    }
    function attack(f, kind) {
      if (f.attack || f.cooldown > 0 || f.jump > 0 || f.crouch) return false;
      f.attack = { ...attacks[kind], kind, elapsed: 0, resolved: false };
      f.cooldown = attacks[kind].duration + .15;
      return true;
    }
    function action(key) {
      if (state.result) return;
      const a = state.arthur;
      if (key === "jump" && !a.attack && a.jump === 0) { a.jump = .8; a.crouch = false; }
      if (key === "meia") attack(a, "meia");
      if (key === "rasteira") attack(a, "rasteira");
      if (key === "armada") {
        if (state.energy >= 100 && attack(a, "special")) { state.energy = 0; state.flash = "Giro do Portal!"; }
        else attack(a, "armada");
      }
      if (key === "music") { enableAudio(); sound(true); }
    }
    function resolve(f, opponent, dt) {
      const hit = f.attack;
      if (!hit) return;
      hit.elapsed += dt;
      if (!hit.resolved && hit.elapsed >= hit.delay) {
        hit.resolved = true;
        const inRange = Math.abs(f.x - opponent.x) < (hit.kind === "special" ? 225 : 185);
        const dodged = hit.height === "low" ? opponent.jump > 0 : opponent.crouch;
        if (inRange && !dodged) {
          opponent.rhythm = Math.max(0, opponent.rhythm - hit.damage);
          state.flash = `${f === state.arthur ? "Arthur" : "Reverso"}: ${hit.name}!`;
        } else state.flash = dodged && inRange ? "Boa esquiva! A roda continua." : "Gingue para chegar mais perto!";
      }
      if (hit.elapsed >= hit.duration) f.attack = null;
    }
    function update(dt, keys) {
      if (state.result) return state.result;
      state.time += dt;
      const a = state.arthur, b = state.reverse;
      for (const f of [a, b]) { f.jump = Math.max(0, f.jump - dt); f.cooldown = Math.max(0, f.cooldown - dt); }
      a.crouch = keys.has("crouch") && a.jump === 0 && !a.attack;
      const music = keys.has("music") && !a.attack && a.jump === 0 && !a.crouch;
      if (music) {
        state.energy = Math.min(100, state.energy + 34 * dt);
        state.flash = state.energy >= 100 ? "Energia cheia! Use L para o Giro do Portal." : "Arthur toca o berimbau…";
      }
      const direction = Number(keys.has("right")) - Number(keys.has("left"));
      const speed = a.attack || a.crouch || music ? 65 : 200;
      a.x = Math.max(110, Math.min(b.x - 75, a.x + direction * speed * dt));
      if (!b.attack && !b.crouch && b.jump === 0) {
        const distance = b.x - a.x;
        b.x = Math.max(a.x + 75, Math.min(850, b.x + (distance > 150 ? -1 : distance < 105 ? 1 : 0) * 95 * dt));
      }
      // O Reverso anuncia o movimento antes de executá-lo, dando tempo para a esquiva.
      state.aiTimer -= dt;
      if (state.aiTimer <= 0 && !b.attack) {
        const kind = Math.random() < .5 ? "rasteira" : "armada";
        attack(b, kind); state.aiTimer = 2.5;
        state.flash = kind === "rasteira" ? "Reverso prepara rasteira: pule com W!" : "Reverso prepara armada: agache com S!";
        if (b.attack) b.attack.delay += .35;
      }
      resolve(a, b, dt); resolve(b, a, dt);
      const beat = Math.floor(state.time * 100 / 60 * 2);
      if (beat !== state.beat) { state.beat = beat; sound(beat % 4 === 2); }
      if (b.rhythm === 0 || a.rhythm === 0) {
        state.result = b.rhythm === 0 ? "won" : "lost";
        return state.result;
      }
      return null;
    }
    function stop() {
      if (state.audio) { state.audio.close().catch(() => {}); state.audio = null; }
    }
    return { state, action, update, stop, enableAudio };
  }
  function draw(ctx, session, time, person, intro = false, introStep = 0, introElapsed = 0) {
    const s = session.state;
    ctx.fillStyle = "#a7dfe0"; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = "#447b69";
    for (const x of [60, 880]) { ctx.fillRect(x, 180, 18, 230); ctx.beginPath(); ctx.arc(x + 9, 170, 80, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#c8b98a"; ctx.fillRect(0, 410, 960, 130);
    ctx.strokeStyle = "#fff4c9"; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(480, 450, 300, 65, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 7; i++) person(180 + i * 100, 350, i % 3 === 0 ? "princess" : "arthur", Math.sin(time / 240 + i) * 4);
    if (intro) {
      ctx.fillStyle = "#323448"; ctx.fillRect(60, 395, 90, 145);
      ctx.strokeStyle = "#e3ba78"; ctx.lineWidth = 8;
      for (const x of [80, 130]) { ctx.beginPath(); ctx.moveTo(x, 370); ctx.lineTo(x, 540); ctx.stroke(); }
      for (let y = 390; y < 540; y += 25) { ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(130, y); ctx.stroke(); }
    }
    for (const [f, kind, facing] of [[s.arthur, "arthur", 1], [s.reverse, "reverse", -1]]) {
      if (intro && introStep === 0 && kind === "arthur") {
        person(105, 580 - Math.min(1, introElapsed / 2200) * 180, kind, Math.sin(time / 160) * 10);
        continue;
      }
      const jumpY = f.jump > 0 ? Math.sin(f.jump / .8 * Math.PI) * 95 : 0;
      ctx.save(); ctx.translate(f.x, 455 - jumpY);
      if (f.crouch) ctx.scale(1, .55);
      if (f.jump > 0) ctx.rotate((1 - f.jump / .8) * Math.PI * 2 * facing);
      person(0, 0, kind, Math.sin(time / 170) * 9);
      if (f.attack) {
        const hit = f.attack, pulse = Math.sin(Math.min(1, hit.elapsed / hit.duration) * Math.PI);
        ctx.strokeStyle = kind === "arthur" ? "#ff922e" : "#171a25"; ctx.lineWidth = 15;
        ctx.beginPath(); ctx.moveTo(0, -45);
        ctx.lineTo(facing * (35 + pulse * 105), hit.height === "low" ? -12 : -90); ctx.stroke();
        if (hit.kind === "armada" || hit.kind === "special") {
          ctx.strokeStyle = hit.kind === "special" ? "#1dcc91" : "#fff4c9"; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.ellipse(0, -60, 100, 45, hit.elapsed * 4, 0, Math.PI * 1.5); ctx.stroke();
        }
      }
      ctx.restore();
    }
    // Berimbau ao lado da roda.
    ctx.strokeStyle = "#956637"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(75, 380, 18, 75, .2, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.strokeStyle = "#f7ebc9"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(90, 305); ctx.lineTo(60, 452); ctx.stroke();
    ctx.fillStyle = "#c8964b"; ctx.beginPath(); ctx.arc(73, 410, 16, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 22px Arial"; ctx.textAlign = "left";
    for (const [x, label, value, color] of [[25, "Ritmo de Arthur", s.arthur.rhythm, "#ff9b3d"], [620, "Ritmo de Reverso", s.reverse.rhythm, "#b394ec"], [25, "Energia · E / Especial · L", s.energy, "#46d7ad"]]) {
      const y = label.startsWith("Energia") ? 100 : 30;
      ctx.fillStyle = "#1c3443"; ctx.fillText(label, x, y);
      ctx.fillStyle = "#344556"; ctx.fillRect(x, y + 10, 315, 14);
      ctx.fillStyle = color; ctx.fillRect(x, y + 10, 315 * value / 100, 14);
    }
    ctx.textAlign = "center"; ctx.fillStyle = "#193447"; ctx.font = "bold 20px Arial";
    if (!intro) ctx.fillText(s.flash, 480, 520);
  }
  window.ArthurCapoeira = { create, draw };
})();
